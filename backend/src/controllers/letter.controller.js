// controllers/letters.controller.js
import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../config/s3.js";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import mammoth from "mammoth";
import Letter from "../models/Letter.js";
import Client from "../models/Client.js";

const BUCKET = process.env.AWS_S3_BUCKET_NAME;

/**
 * List all available letters with categories
 */
export async function listLetters(req, res) {
  try {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET,
      Prefix: "letters/",
      Delimiter: "/",
    });

    const data = await s3.send(command);

    const categories = [];

    // Process categories (folders)
    if (data.CommonPrefixes) {
      for (const prefix of data.CommonPrefixes) {
        const category = prefix.Prefix.replace("letters/", "").replace("/", "");

        // List files in this category
        const filesCommand = new ListObjectsV2Command({
          Bucket: BUCKET,
          Prefix: prefix.Prefix,
        });

        const filesData = await s3.send(filesCommand);

        const letters =
          filesData.Contents?.filter((item) => item.Key.endsWith(".docx")).map(
            (item) => {
              const fileName = item.Key.split("/").pop().replace(".docx", "");
              return {
                name: fileName,
                key: item.Key,
                lastModified: item.LastModified,
              };
            }
          ) || [];

        categories.push({
          category: category,
          letters: letters,
        });
      }
    }

    res.json({
      success: true,
      data: categories,
    });
  } catch (err) {
    console.error("Error listing letters:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch letters",
    });
  }
}

/**
 * Parse letter sections into fromAddress, toAddress, and body
 */
// controllers/letters.controller.js
/**
 * Parse letter sections into fromAddress, toAddress, and body
 */
function parseLetterSections(text) {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  // Find the index where the recipient address starts (look for bureau names)
  const toAddressStartIndex = lines.findIndex(
    (line) =>
      line.toUpperCase().includes("EQUIFAX") ||
      line.toUpperCase().includes("EXPERIAN") ||
      line.toUpperCase().includes("TRANSUNION")
  );

  // Find the index where the body starts (after recipient address)
  let bodyStartIndex = toAddressStartIndex;
  if (toAddressStartIndex !== -1) {
    // Skip the bureau name and address lines (usually 3 lines: name, address line 1, address line 2)
    bodyStartIndex = toAddressStartIndex + 3;
    
    // Look for the actual body content (skip empty lines after address)
    for (let i = bodyStartIndex; i < lines.length; i++) {
      if (lines[i] && lines[i].length > 0) {
        bodyStartIndex = i;
        break;
      }
    }
  }

  if (toAddressStartIndex === -1) {
    // If we can't find the bureau name, use fallback logic
    return {
      fromAddress: lines.slice(0, 6).join("\n"), // First 6 lines as sender info
      toAddress: "EQUIFAX\nP.O. BOX 740250\nATLANTA, GA 30374", // Default address
      body: lines.slice(6).join("\n"), // Rest as body
    };
  }

  // From address is everything before the bureau name
  const fromAddress = lines.slice(0, toAddressStartIndex).join("\n");

  // To address is the bureau name and the next 2 lines (address)
  const toAddress = lines
    .slice(toAddressStartIndex, toAddressStartIndex + 3)
    .join("\n");

  // Body is everything after the recipient address
  const body = lines.slice(bodyStartIndex).join("\n");

  return { fromAddress, toAddress, body };
}

/**
 * Get letter content and convert DOCX to HTML
 */
export async function getLetter(req, res) {
  const { category, name } = req.params;

  try {
    const key = `letters/${category}/${name}.docx`;

    const command = new GetObjectCommand({
      Bucket: BUCKET,
      Key: key,
    });

    // Get the file stream from S3
    const response = await s3.send(command);
    const chunks = [];

    for await (const chunk of response.Body) {
      chunks.push(chunk);
    }

    const buffer = Buffer.concat(chunks);

    // Extract raw text for parsing sections
    const textResult = await mammoth.extractRawText({ buffer });
    const plainText = textResult.value;

    // Parse the letter sections
    const { fromAddress, toAddress, body } = parseLetterSections(plainText);

    // Convert ONLY the body to HTML (not the entire document)
    const bodyHtml = await mammoth.convertToHtml({ 
      buffer,
      // Optional: Add transform to process only the body content if needed
    });

    // Generate signed URL for download
    const downloadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

    res.json({
      success: true,
      data: {
        html: bodyHtml.value, // Only the body content as HTML
        plainText: plainText,
        fromAddress: fromAddress,
        toAddress: toAddress,
        body: body,
        downloadUrl: downloadUrl,
        category: category,
        name: name,
      },
    });
  } catch (err) {
    console.error("Error fetching letter:", err);

    if (err.name === "NoSuchKey") {
      return res.status(404).json({
        success: false,
        message: "Letter not found",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to fetch letter",
    });
  }
}
/**
 * Save a generated letter to the database
 */
// In controllers/letters.controller.js, update the saveLetter function

export async function saveLetter(req, res) {
  try {
    console.log("Received letter data:", req.body);
    console.log("User ID:", req.user?.id);
    
    const {
      clientId,
      letterName,
      abbreviation,
      round,
      category,
      bureau,
      content,
      personalInfo,
      selectedFtcReports,
      followUpDays,
      createFollowUpTask,
      email
    } = req.body;

    // Validate required fields
    if (
      !letterName ||
      !category ||
      !bureau ||
      !content ||
      content.trim() === ""
    ) {
      console.log("Validation failed for letter data:", {
        clientId,
        letterName,
        category,
        bureau,
        content,
      });
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        details: {
          clientId: !clientId,
          letterName: !letterName,
          category: !category,
          bureau: !bureau,
          content: !content || content.trim() === "",
        },
      });
    }

    // Validate email: required only if no clientId
    if (!clientId && (!email || email.trim() === "")) {
      return res.status(400).json({
        success: false,
        message: "Email is required when no client is associated",
      });
    }

    // Check if client exists (only if clientId is provided)
    let client = null;
    if (clientId) {
      try {
        client = await Client.findById(clientId);
        if (!client) {
          console.log("Client not found with ID:", clientId);
          return res.status(404).json({
            success: false,
            message: "Client not found",
          });
        }
        console.log("Client found:", client._id);
      } catch (error) {
        console.error("Error with client lookup:", error);
        return res.status(500).json({
          success: false,
          message: "Error validating client",
        });
      }
    } else {
      console.log("No client ID provided - saving letter with email:", email);
    }

    // Create new letter
    const letterData = {
      clientId,
      letterName,
      abbreviation,
      round: round || 1,
      category,
      bureau,
      content,
      personalInfo,
      selectedFtcReports: selectedFtcReports || [],
      followUpDays: followUpDays || 2,
      createFollowUpTask: createFollowUpTask !== false,
      createdBy: req.user?.id,
    };

    // Add email only if no clientId (or add it always for consistency)
    if (email) {
      letterData.email = email.trim().toLowerCase();
    } else if (client) {
      // If we have a client but no email, use client's email
      letterData.email = client.email;
    }
    
    console.log("Creating letter with data:", letterData);
    
    const letter = new Letter(letterData);
    await letter.save();
    
    console.log("Letter saved successfully:", letter._id);

    res.status(201).json({
      success: true,
      data: letter,
      message: "Letter saved successfully",
    });
  } catch (error) {
    console.error("Error saving letter:", error);
    
    // Handle validation errors specifically
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors,
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Failed to save letter",
    });
  }
}

/**
 * Get all letters for a specific client
 */
export async function getClientLetters(req, res) {
  try {
    const { clientId } = req.params;
    const { status, bureau } = req.query;

    // Build query
    const query = { clientId };
    if (status) query.status = status;
    if (bureau) query.bureau = bureau;

    const letters = await Letter.find(query)
      .populate('clientId', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: letters,
    });
  } catch (error) {
    console.error("Error fetching client letters:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch letters",
    });
  }
}

/**
 * Get a specific letter by ID
 */
export async function getLetterById(req, res) {
  try {
    const { letterId } = req.params;

    const letter = await Letter.findById(letterId)
      .populate('clientId', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email');

    if (!letter) {
      return res.status(404).json({
        success: false,
        message: "Letter not found",
      });
    }

    res.json({
      success: true,
      data: letter,
    });
  } catch (error) {
    console.error("Error fetching letter:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch letter",
    });
  }
}

/**
 * Update letter status (send, deliver, etc.)
 */
export async function updateLetterStatus(req, res) {
  try {
    const { letterId } = req.params;
    const { status, trackingNumber, sendMethod } = req.body;

    const letter = await Letter.findById(letterId);
    if (!letter) {
      return res.status(404).json({
        success: false,
        message: "Letter not found",
      });
    }

    // Update letter status and related fields
    letter.status = status;
    if (trackingNumber) letter.trackingNumber = trackingNumber;
    if (sendMethod) letter.sendMethod = sendMethod;
    
    if (status === 'sent') {
      letter.dateSent = new Date();
    } else if (status === 'delivered') {
      letter.dateDelivered = new Date();
    }

    letter.lastModifiedBy = req.user?.id;
    await letter.save();

    res.json({
      success: true,
      data: letter,
      message: "Letter status updated successfully",
    });
  } catch (error) {
    console.error("Error updating letter status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update letter status",
    });
  }
}

/**
 * Delete a letter
 */
export async function deleteLetter(req, res) {
  try {
    const { letterId } = req.params;

    const letter = await Letter.findById(letterId);
    if (!letter) {
      return res.status(404).json({
        success: false,
        message: "Letter not found",
      });
    }

    await Letter.findByIdAndDelete(letterId);

    res.json({
      success: true,
      message: "Letter deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting letter:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete letter",
    });
  }
}
