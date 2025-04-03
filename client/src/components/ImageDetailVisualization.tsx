import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';

// Define proper types for all data structures
interface Dimensions {
  width: number;
  height: number;
  megapixels: number;
}

interface FileInfo {
  format: string;
  resolution: string;
  file_size_mb: number;
  dimensions?: Dimensions;
}

interface QualityScores {
  overall_quality: number;
  blur_score?: number;
  brightness_score?: number;
  contrast_score?: number;
  detail_score?: number;
  edge_density?: number;
  noise_level?: number;
  sharpness?: number;
}

interface ColorDistribution {
  mean_rgb: number[];
  mean_hsv: number[];
  mean_lab: number[];
  std_rgb: number[];
}

interface ColorAnalysis {
  dominant_colors?: number[][];
  color_distribution?: ColorDistribution;
}

type ObjectId = {
  $oid: string;
};

interface ImageData {
  _id: string;
  title: string;
  image_url: string;
  created_at: string;
  subjectId?: ObjectId;
  diagramTypeId?: ObjectId;
  sub_category?: string;
  sourceType?: string;
  author?: string;
  notes?: string;
  filename?: string;
  extracted_text?: string;
  file_info?: FileInfo;
  quality_scores?: QualityScores;
  color_analysis?: ColorAnalysis;
  quality_rating?: string;
  upload_date?: string;
}

interface ImageDetailVisualizationProps {
  image: ImageData;
  darkMode?: boolean;
}

// Interface for color distribution chart data
interface ColorDistributionItem {
  name: string;
  value: number;
  color: string;
}

// Interface for quality scores radar chart data
interface QualityScoreItem {
  name: string;
  value: number;
}

// Interface for quality rating result
interface QualityRatingResult {
  text: string;
  color: string;
}

const ImageDetailVisualization: React.FC<ImageDetailVisualizationProps> = ({ 
  image, 

}) => {
  // Format date to human-readable
  const formatDate = (dateString?: string): string => {
    if (!dateString) return "Unknown date";
    
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch (error) {
      return "Date error";
    }
  };

  // Format file size
  const formatFileSize = (size?: number): string => {
    if (!size) return "Unknown";
    if (size < 1) {
      return `${(size * 1024).toFixed(0)} KB`;
    }
    return `${size.toFixed(2)} MB`;
  };

  // Convert RGB array to CSS color
  const rgbToColor = (rgb?: number[]): string => {
    if (!rgb || rgb.length < 3) return "#888888";
    return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
  };

  // Get contrast text color (black or white) based on background
  const getContrastColor = (rgb?: number[]): string => {
    if (!rgb || rgb.length < 3) return "#ffffff";
    
    // Calculate relative luminance
    const luminance = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;
    
    return luminance > 0.5 ? "#000000" : "#ffffff";
  };

  // Prepare data for color distribution chart
  const prepareColorDistribution = (): ColorDistributionItem[] => {
    if (!image.color_analysis?.dominant_colors?.length) return [];
    
    return image.color_analysis.dominant_colors.map((color, index) => ({
      name: `Color ${index + 1}`,
      value: 1,
      color: rgbToColor(color),
    }));
  };

  // Normalize quality scores for radar chart
  const normalizeQualityScores = (): QualityScoreItem[] => {
    if (!image.quality_scores) return [];
    
    const normalizeValue = (value?: number, oldMin = 0, oldMax = 100, newMin = 0, newMax = 100): number => {
      if (value === undefined) return 0;
      const normalizedValue = ((value - oldMin) / (oldMax - oldMin)) * (newMax - newMin) + newMin;
      return Math.max(newMin, Math.min(newMax, normalizedValue));
    };
    
    const scoreMapping: QualityScoreItem[] = [
      { name: "Quality", value: image.quality_scores.overall_quality || 0 },
      { name: "Sharpness", value: normalizeValue(image.quality_scores.sharpness, 0, 100, 0, 100) },
      { name: "Detail", value: normalizeValue(image.quality_scores.detail_score, 0, 100, 0, 100) },
      { name: "Brightness", value: normalizeValue(image.quality_scores.brightness_score, 0, 255, 0, 100) },
      { name: "Low Noise", value: 100 - normalizeValue(image.quality_scores.noise_level, 0, 100, 0, 100) },
      { name: "Edge Detail", value: normalizeValue(image.quality_scores.edge_density, 0, 0.1, 0, 100) },
    ];
    
    return scoreMapping.filter(item => item.value !== undefined && !isNaN(item.value));
  };

  // Determine quality rating text and color
  const getQualityRating = (): QualityRatingResult => {
    if (!image.quality_scores?.overall_quality) return { text: "Unknown", color: "gray-500" };
    
    const score = image.quality_scores.overall_quality;
    
    if (score >= 80) return { text: "Excellent", color: "emerald-500" };
    if (score >= 60) return { text: "Good", color: "green-500" };
    if (score >= 40) return { text: "Average", color: "yellow-500" };
    if (score >= 20) return { text: "Poor", color: "orange-500" };
    return { text: "Very Poor", color: "red-500" };
  };

  // Helper function to get a readable quality description
  const getQualityDescription = (): string => {
    if (!image.quality_scores?.overall_quality) return "";
    
    const score = image.quality_scores.overall_quality;
    let description = "";
    
    if (score >= 80) {
      description = "This image has excellent quality with good sharpness and detail. Suitable for professional use.";
    } else if (score >= 60) {
      description = "This image has good quality and is suitable for most purposes. Minor improvements could be made.";
    } else if (score >= 40) {
      description = "This image has average quality. Consider enhancing for important applications.";
    } else if (score >= 20) {
      description = "This image has poor quality. Consider replacing or significantly enhancing it.";
    } else {
      description = "This image has very poor quality and may not be suitable for most purposes.";
    }
    
    // Add specific recommendations based on individual metrics if available
    const recommendations: string[] = [];
    
    if (image.quality_scores.blur_score && image.quality_scores.blur_score > 200) {
      recommendations.push("Image appears blurry. Consider using a sharper source image.");
    }
    
    if (image.quality_scores.brightness_score && image.quality_scores.brightness_score < 40) {
      recommendations.push("Image is too dark. Consider increasing brightness.");
    } else if (image.quality_scores.brightness_score && image.quality_scores.brightness_score > 200) {
      recommendations.push("Image is too bright. Consider reducing brightness.");
    }
    
    if (image.quality_scores.contrast_score && image.quality_scores.contrast_score < 30) {
      recommendations.push("Image has low contrast. Consider enhancing contrast.");
    }
    
    if (image.quality_scores.noise_level && image.quality_scores.noise_level > 50) {
      recommendations.push("Image has significant noise. Consider applying noise reduction.");
    }
    
    // Add recommendations if we have any
    if (recommendations.length > 0) {
      description += " Recommendations: " + recommendations.join(" ");
    }
    
    return description;
  };

  const qualityRating = getQualityRating();
  const qualityDescription = getQualityDescription();
  const colorDistributionData = prepareColorDistribution();
  const qualityScoresData = normalizeQualityScores();

  // Safe access helper functions to avoid TypeScript errors
  const safeJoin = (arr?: number[], separator = ','): string => {
    if (!arr || !Array.isArray(arr)) return '';
    return arr.join(separator);
  };

  const safeMap = <T, U>(arr: T[] | undefined, callback: (item: T, index: number) => U): U[] => {
    if (!arr || !Array.isArray(arr)) return [];
    return arr.map(callback);
  };

  return (
    <div className="bg-slate-800 text-slate-200 rounded-lg shadow-xl w-full max-w-6xl mx-auto overflow-hidden">
      {/* Main Image Header */}
      <div className="relative w-full h-64 md:h-96 overflow-hidden">
        <img 
          src={image.image_url} 
          alt={image.title} 
          className="w-full h-full object-contain bg-slate-900"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white">{image.title}</h1>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {image.sub_category && (
              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                {image.sub_category}
              </span>
            )}
            <span className="bg-slate-700 text-slate-200 px-3 py-1 rounded-full text-sm flex items-center">
              <span className="mr-1">📅</span> {formatDate(image.created_at)}
            </span>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* File Information */}
          {image.file_info && (
            <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
              <h2 className="font-medium text-xl mb-4 text-slate-200">File Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-400">Format</p>
                  <p className="font-medium text-slate-200">
                    <span className="mr-2">🖼️</span>{image.file_info.format || "Unknown"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Size</p>
                  <p className="font-medium text-slate-200">
                    {formatFileSize(image.file_info.file_size_mb)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Resolution</p>
                  <p className="font-medium text-slate-200">{image.file_info.resolution || "Unknown"}</p>
                </div>
                {image.file_info.dimensions && (
                  <>
                    <div>
                      <p className="text-xs text-slate-400">Dimensions</p>
                      <p className="font-medium text-slate-200">
                        {`${image.file_info.dimensions.width}×${image.file_info.dimensions.height}`}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Megapixels</p>
                      <p className="font-medium text-slate-200">
                        {`${image.file_info.dimensions.megapixels.toFixed(2)} MP`}
                      </p>
                    </div>
                  </>
                )}
                {image.sourceType && (
                  <div>
                    <p className="text-xs text-slate-400">Source</p>
                    <p className="font-medium text-slate-200">{image.sourceType}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Extracted Text */}
          {image.extracted_text && (
            <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
              <h2 className="font-medium text-xl mb-3 text-slate-200">
                Extracted Text
                <span className="ml-2 text-sm bg-blue-500 text-white px-2 py-0.5 rounded-full">
                  {image.extracted_text.length} chars
                </span>
              </h2>
              <div className="bg-slate-800 p-4 rounded-md whitespace-pre-wrap font-mono text-slate-300 text-sm overflow-auto max-h-64">
                {image.extracted_text}
              </div>
            </div>
          )}

          {/* Alternative Content - No Color Analysis */}
          {!image.color_analysis && (
            <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
              <h2 className="font-medium text-xl mb-3 text-slate-200">Image Preview</h2>
              <div className="p-4 bg-slate-800 rounded-lg">
                <img 
                  src={image.image_url} 
                  alt={image.title} 
                  className="w-full h-auto rounded shadow-lg"
                />
              </div>
            </div>
          )}
          
          {/* Color Analysis - when available */}
          {image.color_analysis?.dominant_colors && (
            <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
              <h2 className="font-medium text-xl mb-3 text-slate-200">Color Analysis</h2>
              
              {/* Dominant Colors */}
              <div className="mb-6">
                <p className="text-sm mb-2 text-slate-400">Dominant Colors</p>
                <div className="flex items-center space-x-4">
                  {safeMap(image.color_analysis.dominant_colors, (color, i) => (
                    <div key={i} className="group relative">
                      <div 
                        className="w-16 h-16 rounded-lg border border-slate-500 transition-transform group-hover:scale-110 shadow-lg"
                        style={{ backgroundColor: rgbToColor(color) }}
                      >
                        <div 
                          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ color: getContrastColor(color) }}
                        >
                          <span className="text-xs font-mono bg-black bg-opacity-40 px-1 py-0.5 rounded">
                            RGB({safeJoin(color)})
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Color Distribution Chart */}
              {colorDistributionData.length > 0 && (
                <div className="h-64">
                  <p className="text-sm mb-2 text-slate-400">Color Distribution</p>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={colorDistributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {colorDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0.3)" />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Quality Analysis */}
          {image.quality_scores && (
            <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-medium text-xl text-slate-200">Quality Analysis</h2>
                <div className={`px-3 py-1 rounded-full bg-${qualityRating.color} text-white font-medium flex items-center`}>
                  <span className="mr-1">{image.quality_scores.overall_quality}%</span>
                  <span className="text-xs">{qualityRating.text}</span>
                </div>
              </div>
              
              {/* Radar Chart */}
              {qualityScoresData.length > 0 && (
                <div className="h-64 mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={qualityScoresData}>
                      <PolarGrid stroke="#475569" />
                      <PolarAngleAxis dataKey="name" tick={{ fill: "#cbd5e1" }} />
                      <Radar name="Quality" dataKey="value" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.5} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              )}
              
              {/* Raw Scores */}
              <div className="grid grid-cols-2 gap-3 text-sm mt-2">
                {image.quality_scores.blur_score !== undefined && (
                  <div>
                    <p className="text-xs text-slate-400">Blur Score</p>
                    <p className="font-medium text-slate-200">{image.quality_scores.blur_score.toFixed(2)}</p>
                  </div>
                )}
                {image.quality_scores.brightness_score !== undefined && (
                  <div>
                    <p className="text-xs text-slate-400">Brightness</p>
                    <p className="font-medium text-slate-200">{image.quality_scores.brightness_score.toFixed(2)}</p>
                  </div>
                )}
                {image.quality_scores.contrast_score !== undefined && (
                  <div>
                    <p className="text-xs text-slate-400">Contrast</p>
                    <p className="font-medium text-slate-200">{image.quality_scores.contrast_score.toFixed(2)}</p>
                  </div>
                )}
                {image.quality_scores.detail_score !== undefined && (
                  <div>
                    <p className="text-xs text-slate-400">Detail Score</p>
                    <p className="font-medium text-slate-200">{image.quality_scores.detail_score.toFixed(2)}</p>
                  </div>
                )}
                {image.quality_scores.edge_density !== undefined && (
                  <div>
                    <p className="text-xs text-slate-400">Edge Density</p>
                    <p className="font-medium text-slate-200">{image.quality_scores.edge_density.toFixed(3)}</p>
                  </div>
                )}
                {image.quality_scores.noise_level !== undefined && (
                  <div>
                    <p className="text-xs text-slate-400">Noise Level</p>
                    <p className="font-medium text-slate-200">{image.quality_scores.noise_level.toFixed(2)}</p>
                  </div>
                )}
                {image.quality_scores.sharpness !== undefined && (
                  <div>
                    <p className="text-xs text-slate-400">Sharpness</p>
                    <p className="font-medium text-slate-200">{image.quality_scores.sharpness.toFixed(2)}</p>
                  </div>
                )}
                {image.quality_rating && (
                  <div>
                    <p className="text-xs text-slate-400">Rating</p>
                    <p className={`font-medium text-${qualityRating.color}`}>{image.quality_rating}</p>
                  </div>
                )}
              </div>
              
              {/* Overall Quality Score Bar */}
              <div className="mt-6">
                <div className="relative pt-1">
                  <p className="text-sm mb-1 flex justify-between">
                    <span className="text-slate-400">Overall Quality Score</span>
                    <span className="text-cyan-400 font-medium">{image.quality_scores.overall_quality}%</span>
                  </p>
                  <div className="overflow-hidden h-2 mb-1 text-xs flex rounded bg-slate-800">
                    <div 
                      style={{ width: `${image.quality_scores.overall_quality}%` }} 
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-red-500">
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Poor (0)</span>
                    <span>Excellent (100)</span>
                  </div>
                </div>
                
                {/* Quality Description */}
                <div className="mt-4 p-3 bg-slate-800 rounded text-sm text-slate-300">
                  <p>{qualityDescription}</p>
                </div>
              </div>
            </div>
          )}

          {/* Image Statistics */}
          {!image.color_analysis && image.file_info?.dimensions && (
            <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
              <h2 className="font-medium text-xl mb-4 text-slate-200">Image Statistics</h2>
              <div className="space-y-3">
                <div className="bg-slate-800 p-3 rounded-lg">
                  <h3 className="text-slate-300 font-medium mb-2">Dimensions</h3>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <p className="text-xs text-slate-400">Width</p>
                      <p className="text-lg font-medium text-slate-200">{image.file_info.dimensions.width}px</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Height</p>
                      <p className="text-lg font-medium text-slate-200">{image.file_info.dimensions.height}px</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Megapixels</p>
                      <p className="text-lg font-medium text-slate-200">{image.file_info.dimensions.megapixels.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-800 p-3 rounded-lg">
                  <h3 className="text-slate-300 font-medium mb-2">Usage Tips</h3>
                  <ul className="text-sm text-slate-300 space-y-2">
                    <li className="flex items-start">
                      <span className="text-cyan-400 mr-2">•</span>
                      <span>Run color analysis to discover dominant colors and color distribution</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-cyan-400 mr-2">•</span>
                      <span>Compare quality metrics with similar images</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-cyan-400 mr-2">•</span>
                      <span>Check image dimensions for appropriate use cases</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
          
          {/* Color Details */}
          {image.color_analysis?.color_distribution && (
            <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
              <h2 className="font-medium text-xl mb-4 text-slate-200">Color Distribution Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {image.color_analysis.color_distribution.mean_rgb && (
                  <div>
                    <p className="text-xs text-slate-400">Mean RGB</p>
                    <div className="flex items-center mt-1">
                      <div 
                        className="w-8 h-8 rounded mr-2 border border-slate-500"
                        style={{ backgroundColor: `rgb(${safeMap(image.color_analysis.color_distribution.mean_rgb, v => Math.round(v)).join(',')})` }}
                      ></div>
                      <p className="font-mono text-sm text-slate-300">
                        ({safeMap(image.color_analysis.color_distribution.mean_rgb, v => Math.round(v)).join(', ')})
                      </p>
                    </div>
                  </div>
                )}
                {image.color_analysis.color_distribution.std_rgb && (
                  <div>
                    <p className="text-xs text-slate-400">STD RGB</p>
                    <p className="font-mono text-sm text-slate-300">
                      ({safeMap(image.color_analysis.color_distribution.std_rgb, v => Math.round(v)).join(', ')})
                    </p>
                  </div>
                )}
                {image.color_analysis.color_distribution.mean_hsv && (
                  <div>
                    <p className="text-xs text-slate-400">Mean HSV</p>
                    <p className="font-mono text-sm text-slate-300">
                      ({safeMap(image.color_analysis.color_distribution.mean_hsv, v => Math.round(v)).join(', ')})
                    </p>
                  </div>
                )}
                {image.color_analysis.color_distribution.mean_lab && (
                  <div>
                    <p className="text-xs text-slate-400">Mean LAB</p>
                    <p className="font-mono text-sm text-slate-300">
                      ({safeMap(image.color_analysis.color_distribution.mean_lab, v => Math.round(v)).join(', ')})
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Footer Actions */}
      <div className="p-4 border-t border-slate-700 flex flex-wrap gap-3 justify-between items-center">
        <div className="flex flex-wrap gap-2">
          <button className="bg-slate-600 text-slate-200 px-4 py-2 rounded flex items-center hover:bg-slate-500 transition">
            <span className="mr-2">🔗</span> Copy Link
          </button>
          <button className="bg-slate-600 text-slate-200 px-4 py-2 rounded flex items-center hover:bg-slate-500 transition">
            <span className="mr-2">⬇️</span> Download
          </button>
        </div>
        <div className="text-slate-400 text-sm">
          Last updated: {formatDate(image.created_at)}
        </div>
      </div>
    </div>
  );
};

export default ImageDetailVisualization;