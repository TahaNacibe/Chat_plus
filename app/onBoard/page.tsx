'use client'
import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Upload, User, MessageCircle, Settings, Sparkles, Camera } from 'lucide-react';
import { create_userProfile } from '@/services/API/profile_services';
import { useRouter } from 'next/navigation';



const OnboardingFlow = () => {
    const router = useRouter();

    const [currentStep, setCurrentStep] = useState<number>(0);
    const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
    const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
    const [profileData, setProfileData] = useState<ProfileData>({
        profilePicture: null,
        username: '',
        aboutMe: '',
        responseStyle: '',
        additionalInfo: ''
    });

    const steps = [
        {
            id: 'profile-picture',
            title: 'Profile Picture',
            subtitle: 'Add a photo to personalize your experience',
        },
        {
            id: 'username',
            title: 'Your Name',
            subtitle: 'What should we call you?',
        },
        {
            id: 'about-me',
            title: 'About You',
            subtitle: 'Tell us a bit about yourself',
        },
        {
            id: 'response-style',
            title: 'Response Style',
            subtitle: 'How would you like me to communicate?',
        },
        {
            id: 'additional-info',
            title: 'Final Details',
            subtitle: 'Any additional preferences?',
        }
    ];

    const responseStyles = [
        { 
            id: 'friendly', 
            label: 'Friendly & Warm', 
            description: 'Conversational, supportive, and encouraging',
        },
        { 
            id: 'professional', 
            label: 'Professional & Direct', 
            description: 'Clear, concise, and business-focused',
        },
        { 
            id: 'creative', 
            label: 'Creative & Playful', 
            description: 'Imaginative, fun, and engaging',
        },
        { 
            id: 'analytical', 
            label: 'Detailed & Thorough', 
            description: 'Comprehensive, data-driven responses',
        }
    ];

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setDirection('forward');
            setIsTransitioning(true);
            setTimeout(() => {
                setCurrentStep(currentStep + 1);
                setIsTransitioning(false);
            }, 250);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setDirection('backward');
            setIsTransitioning(true);
            setTimeout(() => {
                setCurrentStep(currentStep - 1);
                setIsTransitioning(false);
            }, 250);
        }
    };

    const handleGetStarted = async () => {
        console.log("started")
        const resp = await create_userProfile(profileData);
        router.push('/');
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files) return;
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const result = e.target?.result as string;
                setProfileData((prev) => ({
                    ...prev,
                    profilePicture: result,
                }));
            };

            reader.readAsDataURL(file);
        }
    };

    const updateProfileData = (field: keyof typeof profileData, value: string | null) => {
        setProfileData(prev => ({ ...prev, [field]: value }));
    };

    const canProceed = () => {
        const step = steps[currentStep];
        switch (step.id) {
            case 'username':
                return profileData.username.trim().length > 0;
            case 'about-me':
                return profileData.aboutMe.trim().length > 0;
            case 'response-style':
                return profileData.responseStyle !== '';
            default:
                return true;
        }
    };

    const renderStepContent = () => {
        const step = steps[currentStep];
        
        switch (step.id) {
            case 'profile-picture':
                return (
                    <div className="flex flex-col items-center space-y-8">
                        <div className="relative group">
                            <div className={`w-52 h-52 rounded-full bg-gray-50 dark:bg-black border-2 flex items-center justify-center overflow-hidden transition-all duration-300 hover:border-gray-400 hover:shadow-lg ${profileData.profilePicture ? 'border-black' : 'border-dashed border-gray-300'}`}>
                                {profileData.profilePicture ? (
                                    <img src={profileData.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex flex-col items-center space-y-3 text-gray-400 group-hover:text-gray-500 transition-colors">
                                        <Camera className="w-12 h-12" />
                                        <span className="text-sm font-medium">Click to add photo</span>
                                    </div>
                                )}
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileUpload}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            {profileData.profilePicture && (
                                <button
                                    onClick={() => updateProfileData('profilePicture', null)}
                                    className="absolute bottom-6 -right-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm hover:bg-black/50 transition-colors shadow-lg border border-black"
                                >
                                    ×
                                </button>
                            )}
                        </div>
                        <div className="text-center max-w-lg">
                            <p className="text-gray-600 text-lg mb-2">
                                Upload a profile picture to get started
                            </p>
                            <p className="text-gray-500 text-sm">
                                This is optional - you can always add one later in your settings.
                            </p>
                        </div>
                    </div>
                );

            case 'username':
                return (
                    <div className="max-w-2xl mx-auto space-y-6">
                        <input
                            type="text"
                            placeholder="Enter your name"
                            value={profileData.username}
                            spellCheck={false}
                            onChange={(e) => updateProfileData('username', e.target.value)}
                            className="w-full px-0 py-6 text-3xl font-light bg-transparent border-0 border-b-2 border-gray-200 focus:border-black focus:outline-none transition-colors placeholder:text-gray-400 text-center"
                            autoFocus
                        />
                        <p className="text-gray-500 text-center text-lg">This is how I'll address you in our conversations.</p>
                    </div>
                );

            case 'about-me':
                return (
                    <div className="max-w-3xl mx-auto space-y-6">
                        <textarea
                            placeholder="Share something about yourself - your interests, goals, or anything you'd like me to know..."
                            value={profileData.aboutMe}
                            onChange={(e) => updateProfileData('aboutMe', e.target.value)}
                            rows={6}
                            spellCheck={false}
                            className="w-full px-6 py-6 text-lg font-light focus:ring-0 border-gray-200 border bg-gray-50 dark:bg-black focus:bg-white transition-all resize-none placeholder:text-gray-400 rounded-lg"
                            autoFocus
                        />
                        <p className="text-gray-500 text-center text-lg">
                            Help me understand you better so I can provide more personalized assistance.
                        </p>
                    </div>
                );

            case 'response-style':
                return (
                    <div className="max-w-4xl mx-auto space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            {responseStyles.map((style) => (
                                <label
                                    key={style.id}
                                    className={`block p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800 hover:shadow-md ${
                                        profileData.responseStyle === style.id
                                            ? 'border-black/40 bg-gray-50 shadow-lg dark:bg-black dark:border-gray-800'
                                            : 'border-gray-200'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="responseStyle"
                                        value={style.id}
                                        checked={profileData.responseStyle === style.id}
                                        onChange={(e) => updateProfileData('responseStyle', e.target.value)}
                                        className="sr-only"
                                    />
                                    <div className="text-center">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{style.label}</h3>
                                        <p className="text-gray-600 text-sm leading-relaxed">{style.description}</p>
                                        <div className={`mt-4 w-5 h-5 rounded-full border-2 mx-auto transition-colors ${
                                            profileData.responseStyle === style.id
                                                ? 'border-black/50 bg-black'
                                                : 'border-gray-300'
                                        }`}>
                                            {profileData.responseStyle === style.id && (
                                                <div className="w-full h-full rounded-full bg-white scale-50"></div>
                                            )}
                                        </div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                );

            case 'additional-info':
                return (
                    <div className="max-w-3xl mx-auto space-y-6">
                        <textarea
                            placeholder="Any specific preferences, topics of interest, or communication styles you'd like me to know about? This field is completely optional."
                            value={profileData.additionalInfo}
                            onChange={(e) => updateProfileData('additionalInfo', e.target.value)}
                            rows={6}
                            spellCheck={false}
                            className="w-full px-6 py-6 text-lg font-light bg-gray-50 dark:bg-black focus:bg-white transition-all resize-none placeholder:text-gray-400 rounded-lg"
                            autoFocus
                        />
                        <p className="text-gray-500 text-center text-lg">
                            This helps me tailor my responses to your specific needs and preferences.
                        </p>
                    </div>
                );

            default:
                return null;
        }
    };

    const currentStepData = steps[currentStep];

    return (
        <div className="h-screen bg-white dark:bg-black flex flex-col z-[80]">
            {/* Top Navigation Bar */}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col">
                {/* Step Header */}
                <div className="text-center py-12 px-12">
                    <h2 className="text-4xl font-light text-gray-900 dark:text-white mb-4">{currentStepData.title}</h2>
                    <p className="text-xl text-gray-600 dark:text-gray-200 max-w-2xl mx-auto leading-relaxed">
                        {currentStepData.subtitle}
                    </p>
                </div>

                {/* Step Content */}
                <div className="flex-1 px-12 pb-8">
                    <div className={`h-full flex items-center justify-center transition-all duration-250 ${
                        isTransitioning 
                            ? `opacity-0 transform ${direction === 'forward' ? 'translate-x-8' : '-translate-x-8'}` 
                            : 'opacity-100 transform translate-x-0'
                    }`}>
                        <div className="w-full">
                            {renderStepContent()}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Navigation */}
                <div className="mt-6 w-full bg-gray-200 dark:bg-gray-500 h-1 rounded-full overflow-hidden">
                    <div 
                        className="bg-gray-900 h-full transition-all duration-500 ease-out"
                        style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                    ></div>
                </div>
            <div className="bg-gray-50 dark:bg-black border-t border-gray-200 dark:border-gray-900 px-12 py-6">
                <div className="flex items-center justify-between">
                    <button
                        onClick={handleBack}
                        disabled={currentStep === 0}
                        className={`flex items-center space-x-3 px-6 py-3 rounded-lg font-medium transition-colors ${
                            currentStep === 0
                                ? 'text-gray-400 cursor-not-allowed'
                                : 'text-gray-700 hover:text-black hover:bg-gray-200'
                        }`}
                    >
                        <ChevronLeft className="w-5 h-5" />
                        <span>Previous</span>
                    </button>

                    {currentStep === steps.length - 1 ? (
                        <button
                            onClick={handleGetStarted}
                            className="bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors flex items-center space-x-3 font-medium shadow-sm"
                        >
                            <span>Complete Setup</span>
                            <Sparkles className="w-5 h-5" />
                        </button>
                    ) : (
                        <button
                            onClick={handleNext}
                            disabled={!canProceed()}
                            className={`flex items-center space-x-3 px-8 py-3 rounded-lg font-medium transition-colors shadow-sm ${
                                canProceed()
                                    ? 'bg-black text-white hover:bg-gray-800'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                        >
                            <span>Continue</span>
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OnboardingFlow;