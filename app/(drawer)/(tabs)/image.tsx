import { View, Text, TouchableOpacity, Image, Alert, ScrollView, ActivityIndicator } from "react-native";
import { useState } from "react";
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';
import { SkinImageWithGemini } from '@/src/api/gemeniApi'; // Adjust import path

interface AnalysisResult {
    mostLikelyCondition?: string;
    otherPossibleConditions?: string[];
    severityLevel?: string;
    visibleSkinCharacteristics?: {
        lesionType?: string;
        color?: string;
        texture?: string;
        borders?: string;
        distributionPattern?: string;
        inflammation?: string;
        infectionSigns?: string;
        cutsWoundsAbrasions?: string;
        bleeding?: string;
    };
    clarityNote?: string;
    urgencyAssessment?: string;
    recommendedNextSteps?: string[];
}

const ImageTab = () => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

    const pickImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'We need camera roll permissions to select images.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });

            if (!result.canceled) {
                setUploading(true);
                setSelectedImage(result.assets[0].uri);
                setAnalysisResult(null);
                setUploading(false);

                // Start analysis automatically
                await analyzeImage(result.assets[0].uri);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to pick image');
            setUploading(false);
        }
    };

    const parseGeminiResponse = (responseText: string): AnalysisResult => {
        try {
            // If response is already an object, return it
            if (typeof responseText === 'object') {
                return responseText as AnalysisResult;
            }

            const result: AnalysisResult = {};

            // Parse Most Likely Condition
            const conditionMatch = responseText.match(/1\.\s*Most Likely Condition\s*-\s*(.+?)(?=\n|2\.)/s);
            if (conditionMatch) {
                result.mostLikelyCondition = conditionMatch[1].trim();
            }

            // Parse Other Possible Conditions
            const otherConditionsMatch = responseText.match(/2\.\s*Other Possible Conditions.*?\n([\s\S]*?)(?=\n3\.|\n\d\.)/);
            if (otherConditionsMatch) {
                const conditions = otherConditionsMatch[1]
                    .split('\n')
                    .map(line => line.replace(/^\s*-\s*/, '').trim())
                    .filter(line => line.length > 0);
                result.otherPossibleConditions = conditions;
            }

            // Parse Severity Level
            const severityMatch = responseText.match(/3\.\s*Severity Level\s*-\s*(.+?)(?=\n|4\.)/s);
            if (severityMatch) {
                result.severityLevel = severityMatch[1].trim();
            }

            // Parse Visible Skin Characteristics
            const characteristicsMatch = responseText.match(/4\.\s*Visible Skin Characteristics([\s\S]*?)(?=\n5\.|\n\d\.)/);
            if (characteristicsMatch) {
                const characteristics: any = {};
                const charText = characteristicsMatch[1];

                const lesionTypeMatch = charText.match(/lesion type:\s*(.+?)(?=\n|$)/i);
                if (lesionTypeMatch) characteristics.lesionType = lesionTypeMatch[1].trim();

                const colorMatch = charText.match(/color:\s*(.+?)(?=\n|$)/i);
                if (colorMatch) characteristics.color = colorMatch[1].trim();

                const textureMatch = charText.match(/texture:\s*(.+?)(?=\n|$)/i);
                if (textureMatch) characteristics.texture = textureMatch[1].trim();

                const bordersMatch = charText.match(/borders:\s*(.+?)(?=\n|$)/i);
                if (bordersMatch) characteristics.borders = bordersMatch[1].trim();

                const distributionMatch = charText.match(/distribution pattern:\s*(.+?)(?=\n|$)/i);
                if (distributionMatch) characteristics.distributionPattern = distributionMatch[1].trim();

                const inflammationMatch = charText.match(/inflammation:\s*(.+?)(?=\n|$)/i);
                if (inflammationMatch) characteristics.inflammation = inflammationMatch[1].trim();

                const infectionMatch = charText.match(/infection signs:\s*(.+?)(?=\n|$)/i);
                if (infectionMatch) characteristics.infectionSigns = infectionMatch[1].trim();

                result.visibleSkinCharacteristics = characteristics;
            }

            // Parse Clarity Note
            const clarityMatch = responseText.match(/5\.\s*Clarity Note\s*-\s*(.+?)(?=\n|6\.)/s);
            if (clarityMatch) {
                result.clarityNote = clarityMatch[1].trim();
            }

            // Parse Urgency Assessment
            const urgencyMatch = responseText.match(/6\.\s*Urgency Assessment\s*-\s*(.+?)(?=\n|7\.)/s);
            if (urgencyMatch) {
                result.urgencyAssessment = urgencyMatch[1].trim();
            }

            // Parse Recommended Next Steps
            const stepsMatch = responseText.match(/7\.\s*Recommended Next Steps([\s\S]*?)$/);
            if (stepsMatch) {
                const steps = stepsMatch[1]
                    .split('\n')
                    .map(line => line.replace(/^\s*-\s*/, '').trim())
                    .filter(line => line.length > 0);
                result.recommendedNextSteps = steps;
            }

            return result;
        } catch (error) {
            console.error('Parse Error:', error);
            return {};
        }
    };

    const analyzeImage = async (imageUri: string) => {
        try {
            setAnalyzing(true);

            // Convert image to base64
            const base64data = await FileSystem.readAsStringAsync(imageUri, {
                encoding: FileSystem.EncodingType.Base64
            });

            // Call Gemini API with base64 string directly
            const response = await SkinImageWithGemini(base64data);

            // DEBUG: Log the exact response structure
            console.log('=== GEMINI RESPONSE ===');
            console.log('Raw Response:', response);
            console.log('Response Type:', typeof response);
            console.log('======================');

            // Parse the response
            const parsedResult = parseGeminiResponse(response);
            console.log('Parsed Result:', JSON.stringify(parsedResult, null, 2));

            setAnalysisResult(parsedResult);
        } catch (error) {
            console.error('Analysis Error:', error);
            Alert.alert('Analysis Failed', 'Unable to analyze the image. Please try again.');
        } finally {
            setAnalyzing(false);
        }
    };

    const removeImage = () => {
        setSelectedImage(null);
        setAnalysisResult(null);
    };

    const getSeverityColor = (severity?: string) => {
        const level = severity?.toLowerCase();
        if (level?.includes('high') || level?.includes('severe') || level?.includes('urgent')) return '#ef4444';
        if (level?.includes('medium') || level?.includes('moderate')) return '#f59e0b';
        return '#10b981';
    };

    const getUrgencyColor = (urgency?: string) => {
        const level = urgency?.toLowerCase();
        if (level?.includes('urgent') || level?.includes('immediate')) return '#ef4444';
        if (level?.includes('prompt') || level?.includes('soon')) return '#f59e0b';
        return '#10b981';
    };

    return (
        <View className='flex-1 bg-white'>
            <View style={{ paddingTop: 22, paddingBottom: 10, paddingHorizontal: 24 }}>
                <Text style={{ fontSize: 30, fontWeight: 'bold', color: '#1f2937' }}>Skin Analysis</Text>
                <Text style={{ color: '#6b7280', marginTop: 8 }}>Upload an image for AI-powered analysis</Text>
            </View>

            <ScrollView style={{ flex: 1, paddingHorizontal: 24 }} showsVerticalScrollIndicator={false}>
                {!selectedImage ? (
                    <View style={{ alignItems: 'center', paddingVertical: 48 }}>
                        <TouchableOpacity
                            onPress={pickImage}
                            disabled={uploading}
                            activeOpacity={0.8}
                            style={{
                                backgroundColor: '#9333ea',
                                borderRadius: 24,
                                padding: 32,
                                width: '100%',
                                maxWidth: 400,
                                shadowColor: '#9333ea',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.3,
                                shadowRadius: 8,
                                elevation: 8
                            }}
                        >
                            <View style={{ alignItems: 'center' }}>
                                <View style={{ backgroundColor: 'white', borderRadius: 50, padding: 24, marginBottom: 16 }}>
                                    <Ionicons name="cloud-upload-outline" size={64} color="#9333ea" />
                                </View>
                                <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>
                                    {uploading ? 'Uploading...' : 'Choose Image'}
                                </Text>
                                <Text style={{ color: '#e9d5ff', textAlign: 'center' }}>
                                    Tap to select an image from your gallery
                                </Text>
                            </View>
                        </TouchableOpacity>

                        <View style={{ marginTop: 48, flexDirection: 'row', justifyContent: 'center', gap: 16 }}>
                            <View style={{ backgroundColor: '#f3e8ff', borderRadius: 50, padding: 16 }}>
                                <Ionicons name="images-outline" size={32} color="#9333ea" />
                            </View>
                            <View style={{ backgroundColor: '#fce7f3', borderRadius: 50, padding: 16 }}>
                                <Ionicons name="camera-outline" size={32} color="#ec4899" />
                            </View>
                            <View style={{ backgroundColor: '#dbeafe', borderRadius: 50, padding: 16 }}>
                                <Ionicons name="sparkles-outline" size={32} color="#3b82f6" />
                            </View>
                        </View>
                    </View>
                ) : (

                    <View style={{ paddingBottom: 32 }}>
                        <View style={{ backgroundColor: 'white', borderRadius: 24, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5, marginBottom: 24 }}>
                            <Image
                                source={{ uri: selectedImage }}
                                style={{ width: '100%', height: 320, borderRadius: 16 }}
                                resizeMode="cover"
                            />
                            
                            <View style={{ flexDirection: 'row', marginTop: 24, gap: 12 }}>
                                <TouchableOpacity
                                    onPress={removeImage}
                                    activeOpacity={0.8}
                                    style={{ flex: 1, backgroundColor: '#ef4444', borderRadius: 12, paddingVertical: 16 }}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                        <Ionicons name="trash-outline" size={20} color="white" />
                                        <Text style={{ color: 'white', fontWeight: 'bold', marginLeft: 8 }}>Remove</Text>
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={pickImage}
                                    activeOpacity={0.8}
                                    style={{ flex: 1, backgroundColor: '#9333ea', borderRadius: 12, paddingVertical: 16 }}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                        <Ionicons name="sync-outline" size={20} color="white" />
                                        <Text style={{ color: 'white', fontWeight: 'bold', marginLeft: 8 }}>Change</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {analyzing ? (
                            <View style={{ backgroundColor: 'white', borderRadius: 24, padding: 32, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5, alignItems: 'center' }}>
                                <ActivityIndicator size="large" color="#9333ea" />
                                <Text style={{ color: '#374151', fontWeight: '600', marginTop: 16, fontSize: 18 }}>
                                    Analyzing Image...
                                </Text>
                                <Text style={{ color: '#6b7280', marginTop: 8, textAlign: 'center' }}>
                                    Our AI is examining your image
                                </Text>
                            </View>
                        ) : analysisResult ? (
                            <View style={{ gap: 16 }}>
                                <View style={{ backgroundColor: '#10b981', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 }}>
                                    <View style={{ backgroundColor: 'white', borderRadius: 50, padding: 8, marginRight: 12 }}>
                                        <Ionicons name="checkmark-circle" size={32} color="#10b981" />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>Analysis Complete</Text>
                                        <Text style={{ color: '#d1fae5', fontSize: 14 }}>Detailed results below</Text>
                                    </View>
                                </View>

                                {/* Most Likely Condition Card */}
                                {analysisResult.mostLikelyCondition && (
                                    <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                                            <View style={{ backgroundColor: '#f3e8ff', borderRadius: 50, padding: 8, marginRight: 12 }}>
                                                <Ionicons name="medical-outline" size={24} color="#9333ea" />
                                            </View>
                                            <Text style={{ color: '#1f2937', fontWeight: 'bold', fontSize: 18 }}>Most Likely Condition</Text>
                                        </View>
                                        <View style={{ backgroundColor: '#faf5ff', borderRadius: 12, padding: 16, borderLeftWidth: 4, borderLeftColor: '#9333ea' }}>
                                            <Text style={{ color: '#374151', fontSize: 18, fontWeight: '600' }}>
                                                {analysisResult.mostLikelyCondition}
                                            </Text>
                                        </View>
                                    </View>
                                )}

                                {analysisResult.otherPossibleConditions && analysisResult.otherPossibleConditions.length > 0 && (
                                    <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                                            <View style={{ backgroundColor: '#e0e7ff', borderRadius: 50, padding: 8, marginRight: 12 }}>
                                                <Ionicons name="list-outline" size={24} color="#6366f1" />
                                            </View>
                                            <Text style={{ color: '#1f2937', fontWeight: 'bold', fontSize: 18 }}>Other Possible Conditions</Text>
                                        </View>
                                        {analysisResult.otherPossibleConditions.map((condition, index) => (
                                            <View key={index} style={{ flexDirection: 'row', marginBottom: 10, alignItems: 'center', backgroundColor: '#f8fafc', padding: 12, borderRadius: 8 }}>
                                                <View style={{ backgroundColor: '#6366f1', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4, marginRight: 12 }}>
                                                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 12 }}>{index + 1}</Text>
                                                </View>
                                                <Text style={{ color: '#374151', flex: 1, fontSize: 16 }}>
                                                    {condition}
                                                </Text>
                                            </View>
                                        ))}
                                    </View>
                                )}

                                <View style={{ flexDirection: 'row', gap: 12 }}>
                                    {analysisResult.severityLevel && (
                                        <View style={{ flex: 1, backgroundColor: 'white', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 }}>
                                            <View style={{ alignItems: 'center', marginBottom: 12 }}>
                                                <View style={{ backgroundColor: '#fed7aa', borderRadius: 50, padding: 8, marginBottom: 8 }}>
                                                    <Ionicons name="pulse-outline" size={24} color="#f59e0b" />
                                                </View>
                                                <Text style={{ color: '#6b7280', fontSize: 14, fontWeight: '600' }}>Severity</Text>
                                            </View>
                                            <View
                                                style={{
                                                    borderRadius: 12,
                                                    paddingHorizontal: 12,
                                                    paddingVertical: 8,
                                                    backgroundColor: getSeverityColor(analysisResult.severityLevel) + '20',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                <Text
                                                    style={{
                                                        fontWeight: 'bold',
                                                        fontSize: 16,
                                                        color: getSeverityColor(analysisResult.severityLevel)
                                                    }}
                                                >
                                                    {analysisResult.severityLevel}
                                                </Text>
                                            </View>
                                        </View>
                                    )}

                                    {analysisResult.urgencyAssessment && (
                                        <View style={{ flex: 1, backgroundColor: 'white', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 }}>
                                            <View style={{ alignItems: 'center', marginBottom: 12 }}>
                                                <View style={{ backgroundColor: '#dbeafe', borderRadius: 50, padding: 8, marginBottom: 8 }}>
                                                    <Ionicons name="time-outline" size={24} color="#3b82f6" />
                                                </View>
                                                <Text style={{ color: '#6b7280', fontSize: 14, fontWeight: '600' }}>Urgency</Text>
                                            </View>
                                            <View
                                                style={{
                                                    borderRadius: 12,
                                                    paddingHorizontal: 12,
                                                    paddingVertical: 8,
                                                    backgroundColor: getUrgencyColor(analysisResult.urgencyAssessment) + '20',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                <Text
                                                    style={{
                                                        fontWeight: 'bold',
                                                        fontSize: 14,
                                                        textAlign: 'center',
                                                        color: getUrgencyColor(analysisResult.urgencyAssessment)
                                                    }}
                                                >
                                                    {analysisResult.urgencyAssessment}
                                                </Text>
                                            </View>
                                        </View>
                                    )}
                                </View>

                                {analysisResult.visibleSkinCharacteristics && (
                                    <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                                            <View style={{ backgroundColor: '#e0f2fe', borderRadius: 50, padding: 8, marginRight: 12 }}>
                                                <Ionicons name="eye-outline" size={24} color="#0284c7" />
                                            </View>
                                            <Text style={{ color: '#1f2937', fontWeight: 'bold', fontSize: 18 }}>Skin Characteristics</Text>
                                        </View>

                                        <View style={{ gap: 12 }}>
                                            {analysisResult.visibleSkinCharacteristics.lesionType && (
                                                <View style={{ flexDirection: 'row', backgroundColor: '#f8fafc', padding: 12, borderRadius: 8 }}>
                                                    <Text style={{ color: '#6b7280', fontSize: 14, fontWeight: '600', width: 120 }}>Lesion Type:</Text>
                                                    <Text style={{ color: '#374151', fontSize: 14, flex: 1 }}>{analysisResult.visibleSkinCharacteristics.lesionType}</Text>
                                                </View>
                                            )}
                                            {analysisResult.visibleSkinCharacteristics.color && (
                                                <View style={{ flexDirection: 'row', backgroundColor: '#f8fafc', padding: 12, borderRadius: 8 }}>
                                                    <Text style={{ color: '#6b7280', fontSize: 14, fontWeight: '600', width: 120 }}>Color:</Text>
                                                    <Text style={{ color: '#374151', fontSize: 14, flex: 1 }}>{analysisResult.visibleSkinCharacteristics.color}</Text>
                                                </View>
                                            )}
                                            {analysisResult.visibleSkinCharacteristics.texture && (
                                                <View style={{ flexDirection: 'row', backgroundColor: '#f8fafc', padding: 12, borderRadius: 8 }}>
                                                    <Text style={{ color: '#6b7280', fontSize: 14, fontWeight: '600', width: 120 }}>Texture:</Text>
                                                    <Text style={{ color: '#374151', fontSize: 14, flex: 1 }}>{analysisResult.visibleSkinCharacteristics.texture}</Text>
                                                </View>
                                            )}
                                            {analysisResult.visibleSkinCharacteristics.borders && (
                                                <View style={{ flexDirection: 'row', backgroundColor: '#f8fafc', padding: 12, borderRadius: 8 }}>
                                                    <Text style={{ color: '#6b7280', fontSize: 14, fontWeight: '600', width: 120 }}>Borders:</Text>
                                                    <Text style={{ color: '#374151', fontSize: 14, flex: 1 }}>{analysisResult.visibleSkinCharacteristics.borders}</Text>
                                                </View>
                                            )}
                                            {analysisResult.visibleSkinCharacteristics.distributionPattern && (
                                                <View style={{ flexDirection: 'row', backgroundColor: '#f8fafc', padding: 12, borderRadius: 8 }}>
                                                    <Text style={{ color: '#6b7280', fontSize: 14, fontWeight: '600', width: 120 }}>Distribution:</Text>
                                                    <Text style={{ color: '#374151', fontSize: 14, flex: 1 }}>{analysisResult.visibleSkinCharacteristics.distributionPattern}</Text>
                                                </View>
                                            )}
                                            {analysisResult.visibleSkinCharacteristics.inflammation && (
                                                <View style={{ flexDirection: 'row', backgroundColor: '#f8fafc', padding: 12, borderRadius: 8 }}>
                                                    <Text style={{ color: '#6b7280', fontSize: 14, fontWeight: '600', width: 120 }}>Inflammation:</Text>
                                                    <Text style={{ color: '#374151', fontSize: 14, flex: 1 }}>{analysisResult.visibleSkinCharacteristics.inflammation}</Text>
                                                </View>
                                            )}
                                            {analysisResult.visibleSkinCharacteristics.infectionSigns && (
                                                <View style={{ flexDirection: 'row', backgroundColor: '#f8fafc', padding: 12, borderRadius: 8 }}>
                                                    <Text style={{ color: '#6b7280', fontSize: 14, fontWeight: '600', width: 120 }}>Infection Signs:</Text>
                                                    <Text style={{ color: '#374151', fontSize: 14, flex: 1 }}>{analysisResult.visibleSkinCharacteristics.infectionSigns}</Text>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                )}

                                {analysisResult.clarityNote && (
                                    <View style={{ backgroundColor: '#eff6ff', borderRadius: 12, padding: 16, borderLeftWidth: 4, borderLeftColor: '#3b82f6' }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Ionicons name="information-circle" size={20} color="#3b82f6" />
                                            <Text style={{ color: '#1e40af', marginLeft: 8, fontSize: 14, flex: 1 }}>
                                                {analysisResult.clarityNote}
                                            </Text>
                                        </View>
                                    </View>
                                )}

                                {analysisResult.recommendedNextSteps && analysisResult.recommendedNextSteps.length > 0 && (
                                    <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                                            <View style={{ backgroundColor: '#d1fae5', borderRadius: 50, padding: 8, marginRight: 12 }}>
                                                <Ionicons name="clipboard-outline" size={24} color="#10b981" />
                                            </View>
                                            <Text style={{ color: '#1f2937', fontWeight: 'bold', fontSize: 18 }}>Recommended Next Steps</Text>
                                        </View>
                                        {analysisResult.recommendedNextSteps.map((step, index) => (
                                            <View key={index} style={{ flexDirection: 'row', marginBottom: 12, alignItems: 'flex-start' }}>
                                                <View style={{ backgroundColor: '#10b981', borderRadius: 50, padding: 4, marginRight: 12, marginTop: 4 }}>
                                                    <Ionicons name="checkmark" size={14} color="white" />
                                                </View>
                                                <Text style={{ color: '#374151', flex: 1, fontSize: 15, lineHeight: 22 }}>
                                                    {step}
                                                </Text>
                                            </View>
                                        ))}
                                    </View>
                                )}

                                <View style={{ backgroundColor: '#fef3c7', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#fde68a' }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                                        <Ionicons name="warning-outline" size={20} color="#f59e0b" />
                                        <Text style={{ color: '#92400e', fontWeight: 'bold', marginLeft: 8 }}>Medical Disclaimer</Text>
                                    </View>
                                    <Text style={{ color: '#78350f', fontSize: 14, lineHeight: 20 }}>
                                        This AI analysis is for informational purposes only and should not replace professional medical advice. Please consult with a healthcare provider for proper diagnosis and treatment.
                                    </Text>
                                </View>
                            </View>
                        ) : null}
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

export default ImageTab;