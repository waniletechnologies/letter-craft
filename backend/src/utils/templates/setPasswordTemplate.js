const setPasswordTemplate = (data) => {
  const { setPasswordURL, portalURL, supportEmail, helpEmail, helpCenterURL } = data;
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Set Your Password - Dentist Gold Card</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary: '#ff6b35',
                        secondary: '#f7931e',
                        dark: '#2c3e50',
                        'dark-light': '#34495e',
                        gray: {
                            50: '#f8f9fa',
                            100: '#f1f3f4',
                            200: '#e9ecef',
                            300: '#dee2e6',
                            400: '#ced4da',
                            500: '#adb5bd',
                            600: '#6c757d',
                            700: '#495057',
                            800: '#343a40',
                            900: '#212529'
                        }
                    },
                    animation: {
                        'fall': 'fall 3s linear infinite',
                    },
                    keyframes: {
                        fall: {
                            '0%': { transform: 'translateY(-100px) rotate(0deg)', opacity: '1' },
                            '100%': { transform: 'translateY(400px) rotate(360deg)', opacity: '0' }
                        }
                    }
                }
            }
        }
    </script>
</head>
<body class="bg-gray-100 font-sans text-gray-800 leading-relaxed">
    <div class="max-w-2xl mx-auto bg-white shadow-lg">
        <!-- Header -->
        <div class="bg-gradient-to-br from-dark to-dark-light p-10 text-center relative overflow-hidden">
            <!-- Confetti -->
            <div class="absolute inset-0 pointer-events-none">
                <div class="absolute w-2 h-2 bg-yellow-400 rounded-full animate-fall" style="left: 10%; animation-delay: 0s;"></div>
                <div class="absolute w-2 h-2 bg-pink-400 rounded-full animate-fall" style="left: 20%; animation-delay: 0.5s;"></div>
                <div class="absolute w-2 h-2 bg-blue-400 rounded-full animate-fall" style="left: 30%; animation-delay: 1s;"></div>
                <div class="absolute w-2 h-2 bg-orange-400 rounded-full animate-fall" style="left: 40%; animation-delay: 1.5s;"></div>
                <div class="absolute w-2 h-2 bg-green-400 rounded-full animate-fall" style="left: 50%; animation-delay: 2s;"></div>
                <div class="absolute w-2 h-2 bg-purple-400 rounded-full animate-fall" style="left: 60%; animation-delay: 2.5s;"></div>
                <div class="absolute w-2 h-2 bg-yellow-400 rounded-full animate-fall" style="left: 70%; animation-delay: 0.3s;"></div>
                <div class="absolute w-2 h-2 bg-pink-400 rounded-full animate-fall" style="left: 80%; animation-delay: 0.8s;"></div>
                <div class="absolute w-2 h-2 bg-blue-400 rounded-full animate-fall" style="left: 90%; animation-delay: 1.3s;"></div>
            </div>
            
            <!-- Logo -->
            <div class="text-white text-3xl font-bold tracking-wider mb-2 drop-shadow-lg">DENTIST</div>
            <div class="text-white text-lg font-semibold tracking-wide opacity-90">GOLD CARD</div>
        </div>
        
        <!-- Content -->
        <div class="p-10">
            <!-- Congratulations Section -->
            <div class="flex items-center mb-8">
                <div class="text-2xl mr-4">🎉</div>
                <div class="text-3xl font-bold text-dark">Congratulations!</div>
            </div>
            
            <p class="text-gray-600 mb-10 leading-relaxed">
                Your Dentist Gold Card account is almost setup. To get started, set your password using the secure link below (expires in 24 hours).
            </p>
            
            <h2 class="text-2xl font-bold text-dark mb-6">Make the most of your Gold Card account</h2>
            
            <!-- Feature Items -->
            <div class="space-y-6 mb-8">
                <!-- Feature 1: Set Password -->
                <div class="flex items-start">
                    <div class="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center mr-5 flex-shrink-0">
                        <svg class="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M15 7a2 2 0 0 1 2 2m4 0a6 6 0 0 1-7.743 5.743L11 17H9v2H7v2H4a1 1 0 0 1-1-1v-2.586a1 1 0 0 1 .293-.707l5.964-5.964A6 6 0 1 1 21 9z"/>
                        </svg>
                    </div>
                    <div>
                        <h3 class="text-lg font-semibold text-dark mb-2">1. Set Your Password</h3>
                        <p class="text-gray-600 text-sm leading-relaxed">
                            Click your secure link to create a password and activate your account: 
                            <a href="${setPasswordURL}" class="text-primary font-medium hover:underline">Set Password Link</a>
                        </p>
                    </div>
                </div>
                
                <!-- Feature 2: Sign In -->
                <div class="flex items-start">
                    <div class="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center mr-5 flex-shrink-0">
                        <svg class="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                            <line x1="8" y1="21" x2="16" y2="21"/>
                            <line x1="12" y1="17" x2="12" y2="21"/>
                        </svg>
                    </div>
                    <div>
                        <h3 class="text-lg font-semibold text-dark mb-2">2. Sign into Dentist Gold Card</h3>
                        <p class="text-gray-600 text-sm leading-relaxed">
                            Access your account anytime at 
                            <a href="${portalURL}" class="text-primary font-medium hover:underline">${portalURL}</a>
                        </p>
                    </div>
                </div>
                
                <!-- Feature 3: Complete Profile -->
                <div class="flex items-start">
                    <div class="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center mr-5 flex-shrink-0">
                        <svg class="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14,2 14,8 20,8"/>
                            <line x1="16" y1="13" x2="8" y2="13"/>
                            <line x1="16" y1="17" x2="8" y2="17"/>
                            <polyline points="10,9 9,9 8,9"/>
                        </svg>
                    </div>
                    <div>
                        <h3 class="text-lg font-semibold text-dark mb-2">3. Complete Your Profile</h3>
                        <p class="text-gray-600 text-sm leading-relaxed">
                            Fill in your clinic information and ensure all details are up to date.
                        </p>
                    </div>
                </div>
            </div>
            
            <!-- CTA Button -->
            <div class="text-center">
                <a href="${setPasswordURL}" 
                   class="inline-block bg-gradient-to-r from-primary to-secondary text-white font-semibold py-4 px-8 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300">
                    Set My Password
                </a>
            </div>
        </div>
        
        <!-- Footer -->
        <div class="bg-gray-50 p-8 text-center border-t border-gray-200">
            <p class="text-gray-600 text-sm mb-4">
                If you've already set your password, you can 
                <a href="${portalURL}" class="text-primary font-medium hover:underline">sign in here</a>
            </p>
            
            <div class="pt-4 border-t border-gray-200">
                <p class="text-gray-600 text-sm">
                    Need help? Contact us at 
                    <a href="mailto:${supportEmail}" class="text-primary font-medium hover:underline">${supportEmail}</a><br>
                    or visit our 
                    <a href="${helpCenterURL}" class="text-primary font-medium hover:underline">Help Center</a>
                </p>
            </div>
        </div>
    </div>
</body>
</html>
  `;
};

export default setPasswordTemplate;
