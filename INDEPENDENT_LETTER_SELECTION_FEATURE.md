# Independent Letter Selection Per Group - Feature Documentation

## Overview
Each letter group (Letter 1, Letter 2, Letter 3, etc.) can now have its own independent letter template selection. This means:
- **Group 1** (Experian accounts) can use "Letter Template A"
- **Group 2** (Equifax accounts) can use "Letter Template B"  
- **Group 3** (TransUnion accounts) can use "Letter Template C"

When you generate a different letter for Group 2, it **does NOT change** Group 1's letter template. Each group maintains its own selection independently.

---

## How It Works

### 1. **Per-Group Storage**
The system now tracks two key pieces of data per group:
- **`letterSelectionByGroup[groupIndex]`**: Stores the category, letter name, and original template for each group
- **`letterContentByGroup[groupIndex]`**: Stores the rendered HTML content for each group

### 2. **Workflow**

#### Initial Setup
1. Select accounts (automatically grouped into sets of 5)
2. You'll see "Letter 1", "Letter 2", "Letter 3" in the dropdown

#### Generate Letters Independently
1. **Select "Letter 1"** from the dropdown
2. Choose a letter category (e.g., "Experian Round 1")
3. Choose a letter template (e.g., "Identity Theft Letter")
4. Click **"Generate Library Letter"**
5. ✅ Letter 1 now uses "Identity Theft Letter" for Experian

6. **Switch to "Letter 2"** from the dropdown
7. Choose a different category (e.g., "Equifax Round 1")
8. Choose a different template (e.g., "Verification Letter")
9. Click **"Generate Library Letter"**
10. ✅ Letter 2 now uses "Verification Letter" for Equifax
11. ✅ Letter 1 **still uses** "Identity Theft Letter" (unchanged!)

#### Visual Indicator
- The blue info bar shows: **"Letter [X] Template: [Category] → [Letter Name]"**
- This updates dynamically as you switch between letters in the dropdown
- Each letter displays its own assigned template

---

## Technical Changes

### Files Modified

#### 1. **generate-letter/page.tsx**
- Added `letterSelectionByGroup` state to track category/name/template per group
- Added `letterContentByGroup` state to track rendered content per group
- Updated `loadLetterContent()` to accept `groupIndex` parameter and store data per group
- Modified letter switching logic to load group-specific templates
- Updated `preparedLetters` memo to use per-group data when available
- Updated RichTextEditor `onChange` to persist edits per group
- Updated AI rewrite handler to persist changes per group
- Updated StepTwo to pass `currentGroupIndex` and `onLetterGenerated` callback

#### 2. **components/StepTwo.tsx**
- Added `currentGroupIndex` prop to identify which letter is currently selected
- Added `onLetterGenerated` callback to notify parent when a letter is generated
- Modified `handleGenerateLetter()` to use callback instead of navigation when on generate page

---

## Code Flow

```typescript
// When user clicks "Generate Library Letter" for current group
StepTwo.handleGenerateLetter()
  ↓
  calls: onLetterGenerated(category, letterName)
  ↓
  parent: loadLetterContent(cat, name, selectedGroupIndex)
  ↓
  stores in: letterSelectionByGroup[selectedGroupIndex]
  stores in: letterContentByGroup[selectedGroupIndex]

// When user switches letter dropdown
onChange(newIndex)
  ↓
  setSelectedGroupIndex(newIndex)
  ↓
  useEffect detects change
  ↓
  checks: letterSelectionByGroup[newIndex]
  ↓
  if exists: load group-specific template
  if not: fallback to global template (backward compatibility)

// When user manually edits content
RichTextEditor.onChange(newContent)
  ↓
  setLetterContent(newContent)
  ↓
  setLetterContentByGroup({ ...prev, [selectedGroupIndex]: newContent })

// When saving all letters
preparedLetters.forEach((group, idx) => {
  uses: letterSelectionByGroup[idx] (category, letterName, bureau)
  uses: letterContentByGroup[idx] (final HTML content)
  generates: separate DOCX file per group with correct template
})
```

---

## Validation & Testing

### Test Scenario 1: Different Templates
1. Create 3 groups (15 accounts)
2. Letter 1: Generate "Experian - Identity Theft"
3. Letter 2: Generate "Equifax - Verification"
4. Letter 3: Generate "TransUnion - Goodwill"
5. Switch back to Letter 1
6. ✅ Verify it still shows "Identity Theft" template
7. Switch to Letter 2
8. ✅ Verify it shows "Verification" template

### Test Scenario 2: Manual Edits
1. Generate Letter 1
2. Manually edit the content (add custom text)
3. Switch to Letter 2
4. Generate a different letter
5. Switch back to Letter 1
6. ✅ Verify your custom edits are still there

### Test Scenario 3: AI Rewrite
1. Generate Letter 1
2. Click "Rewrite with AI"
3. Switch to Letter 2
4. Click "Rewrite with AI"
5. Switch back to Letter 1
6. ✅ Verify it shows the AI-rewritten content from step 2

### Test Scenario 4: Save & Continue
1. Set up 3 different letters as above
2. Schedule each letter
3. Click "Save & Continue"
4. Go to "Send Letters" page
5. ✅ Verify 3 separate letters are listed
6. ✅ Verify each has correct template name
7. ✅ Verify each has correct bureau (Experian, Equifax, TransUnion)

---

## Backward Compatibility

The feature includes fallback logic:
- If `letterSelectionByGroup[index]` doesn't exist, uses global `originalTemplateText`
- This ensures old workflows continue to work
- Users who don't need per-group selection won't notice any changes

---

## S3 Storage

All letters are generated and stored in your S3 bucket with the same structure as before:
- Names match the backend `LetterCraft` folder structure
- Each letter is uploaded as a separate DOCX file
- File naming includes bureau type and round number
- Download URLs are tracked per letter in the database

---

## Future Enhancements

Potential improvements:
1. Visual indicator badges on letter dropdown showing which letters have templates assigned
2. Bulk template assignment (e.g., "Apply Template X to all letters")
3. Template preview thumbnails
4. Copy template from one letter to another
5. Template history/undo functionality

---

## Troubleshooting

**Issue**: Letter content not saving when switching groups  
**Solution**: Ensure you're using the updated `RichTextEditor` with the new `onChange` handler

**Issue**: All letters using the same template  
**Solution**: Make sure to click "Generate Library Letter" for each group separately

**Issue**: First letter not getting stored  
**Solution**: The initial load now defaults to storing in group 0 automatically

---

## Summary

✅ Each letter group has independent template selection  
✅ Switching between letters preserves individual content  
✅ Manual edits are saved per letter  
✅ AI rewrites are saved per letter  
✅ All letters are correctly saved to S3 with proper metadata  
✅ Backward compatible with existing workflows
