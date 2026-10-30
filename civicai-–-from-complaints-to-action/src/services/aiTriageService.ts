import { AIAnalysis, Complaint, ComplaintCategory, Department, PriorityLevel } from '../types';

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export class AITriageService {
  /**
   * Evaluates text keywords, location, and existing database complaints
   * to produce explainable AI triage results.
   */
  static analyzeComplaint(
    title: string,
    description: string,
    selectedCategory: ComplaintCategory,
    coords: { lat: number; lng: number },
    existingComplaints: Complaint[]
  ): AIAnalysis {
    const fullText = `${title} ${description}`.toLowerCase();

    // 1. Critical safety trigger analysis
    const criticalTriggers = [
      'live wire',
      'live cable',
      'sparks',
      'electrocution',
      '440v',
      '11kv',
      'death trap',
      'collapsed',
      'sinkhole',
      'crater',
      'accident',
      'severed',
      'burst pipeline',
      'gushing',
      'septic tank',
      'school',
      'children',
      'urgent',
      'swallowed',
      'fire',
    ];

    const highTriggers = [
      'deep pothole',
      'overflowing',
      'flooding',
      'waterlogging',
      'toxic smoke',
      'burning garbage',
      'stray dog bite',
      'broken slab',
      'blackout',
      'pitch dark',
      'unsafe',
      'sewage leaking',
      'contaminated water',
      'signal not working',
    ];

    const detectedKeywords: string[] = [];
    let priority: PriorityLevel = 'Medium';
    let impact = 'Moderate Community Disruption';
    let infrastructureVulnerability: 'Critical' | 'Elevated' | 'Standard' | 'Low' = 'Standard';
    let sentiment: 'Urgent/Alarming' | 'High Frustration' | 'Moderate Concern' | 'Standard Inquiry' =
      'Moderate Concern';

    criticalTriggers.forEach((kw) => {
      if (fullText.includes(kw)) {
        detectedKeywords.push(kw);
      }
    });

    highTriggers.forEach((kw) => {
      if (fullText.includes(kw) && !detectedKeywords.includes(kw)) {
        detectedKeywords.push(kw);
      }
    });

    if (detectedKeywords.some((k) => criticalTriggers.includes(k))) {
      priority = 'Critical';
      impact = 'High public hazard with immediate life or infrastructure danger';
      infrastructureVulnerability = 'Critical';
      sentiment = 'Urgent/Alarming';
    } else if (detectedKeywords.length >= 2 || detectedKeywords.some((k) => highTriggers.includes(k))) {
      priority = 'High';
      impact = 'Elevated public inconvenience and localized safety threat';
      infrastructureVulnerability = 'Elevated';
      sentiment = 'High Frustration';
    } else if (fullText.includes('noise') || fullText.includes('daylight') || fullText.includes('minor')) {
      priority = 'Low';
      impact = 'Minor routine municipal maintenance';
      infrastructureVulnerability = 'Low';
      sentiment = 'Standard Inquiry';
    }

    // 2. Category classification verification
    let identifiedCategory = selectedCategory;
    if (fullText.includes('pothole') || fullText.includes('crater') || fullText.includes('asphalt') || fullText.includes('road')) {
      identifiedCategory = 'Road Damage';
    } else if (fullText.includes('drain') || fullText.includes('culvert') || fullText.includes('gutter') || fullText.includes('silt')) {
      identifiedCategory = 'Drainage Problems';
    } else if (fullText.includes('waterlogging') || fullText.includes('flooding') || fullText.includes('water overflow')) {
      identifiedCategory = 'Waterlogging';
    } else if (fullText.includes('garbage') || fullText.includes('trash') || fullText.includes('waste') || fullText.includes('dumping')) {
      identifiedCategory = 'Waste Management';
    } else if (fullText.includes('light') || fullText.includes('dark') || fullText.includes('lamp') || fullText.includes('bulb')) {
      identifiedCategory = 'Streetlight Issues';
    } else if (fullText.includes('drinking water') || fullText.includes('pipeline') || fullText.includes('tap') || fullText.includes('bwssb')) {
      identifiedCategory = 'Water Supply';
    } else if (fullText.includes('wire') || fullText.includes('shock') || fullText.includes('cable') || fullText.includes('dog bite') || fullText.includes('traffic signal')) {
      identifiedCategory = 'Public Safety';
    }

    // 3. Department matching
    let suggestedDepartment: Department = 'Roads & Infrastructure';
    let slaHours = 24;

    switch (identifiedCategory) {
      case 'Road Damage':
        suggestedDepartment = 'Roads & Infrastructure';
        slaHours = priority === 'Critical' ? 8 : priority === 'High' ? 24 : 48;
        break;
      case 'Drainage Problems':
      case 'Waterlogging':
        suggestedDepartment = 'Drainage & Stormwater';
        slaHours = priority === 'Critical' ? 6 : priority === 'High' ? 18 : 36;
        break;
      case 'Waste Management':
        suggestedDepartment = 'Sanitation & Solid Waste';
        slaHours = priority === 'Critical' ? 8 : priority === 'High' ? 24 : 48;
        break;
      case 'Streetlight Issues':
        suggestedDepartment = 'Electrical & Street Lighting';
        slaHours = priority === 'Critical' ? 4 : priority === 'High' ? 18 : 48;
        break;
      case 'Water Supply':
        suggestedDepartment = 'Water Supply & Sewerage';
        slaHours = priority === 'Critical' ? 6 : priority === 'High' ? 24 : 48;
        break;
      case 'Public Safety':
        if (fullText.includes('electric') || fullText.includes('wire') || fullText.includes('transformer')) {
          suggestedDepartment = 'Electrical & Street Lighting';
        } else {
          suggestedDepartment = 'Public Safety & Vigilance';
        }
        slaHours = priority === 'Critical' ? 2 : 12;
        break;
      default:
        suggestedDepartment = 'General Administration';
        slaHours = 48;
    }

    // 4. Duplicate & Proximity Cluster Detection
    const relatedIds: string[] = [];
    let duplicateCount = 0;
    let maxSimilarity = 0;

    existingComplaints.forEach((existing) => {
      const distKm = calculateDistanceKm(coords.lat, coords.lng, existing.location.coords.lat, existing.location.coords.lng);
      // If within 1.2 km and same category or matching keywords
      const sameCategory = existing.category === identifiedCategory || existing.aiAnalysis.identifiedCategory === identifiedCategory;
      const titleWords = title.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
      const matchingWords = titleWords.filter((w) => existing.title.toLowerCase().includes(w));
      const hasWordOverlap = matchingWords.length >= 2;

      if (distKm <= 0.8 && (sameCategory || hasWordOverlap)) {
        relatedIds.push(existing.id);
        duplicateCount++;
        const score = Math.min(96, Math.round(75 + (1 - distKm / 0.8) * 15 + (hasWordOverlap ? 10 : 0)));
        if (score > maxSimilarity) maxSimilarity = score;
      }
    });

    const isDuplicateOrCluster = duplicateCount > 0;

    // 5. Generate Clear Reasoning & Action Explanation
    let reason = '';
    let action = '';

    if (priority === 'Critical') {
      reason = `Flagged Critical based on life/safety indicators: ${detectedKeywords.slice(0, 3).join(', ') || 'high-hazard environment'}. Rapid failure could affect large pedestrian or transit volumes within the hour.`;
      action = `Issue priority alert to ${suggestedDepartment}. Dispatch rapid response vehicle within ${slaHours} hours and place safety cordons immediately.`;
    } else if (priority === 'High') {
      reason = `Flagged High priority due to elevated public inconvenience, active disruption of local mobility, and negative environmental/hygiene indicators.`;
      action = `Route to ${suggestedDepartment} priority queue. Initiate field site inspection and mobilize maintenance equipment within ${slaHours} hours.`;
    } else if (priority === 'Medium') {
      reason = `Standard civic disruption with moderate impact on neighborhood comfort; no immediate physical danger detected.`;
      action = `Schedule routine inspection by ward beat officers; execute repairs within standard SLA of ${slaHours} hours.`;
    } else {
      reason = `Non-hazardous maintenance report; minimal impact on daily traffic or citizen wellbeing.`;
      action = `Batch into weekly routine service schedule of ${suggestedDepartment}.`;
    }

    const summary =
      title.length > 70
        ? `${title.slice(0, 67)}...`
        : `Verified ${identifiedCategory} incident reported with ${priority} severity.`;

    const riskFactors = [
      `${identifiedCategory} deterioration if left unattended`,
      priority === 'Critical' ? 'Direct physical danger / collision hazard' : 'Pedestrian or vehicle transit slowdown',
      isDuplicateOrCluster ? `Cluster multiplier (${duplicateCount} existing reports in radius)` : 'Isolated incident report',
    ];

    return {
      identifiedCategory,
      confidence: Math.floor(Math.random() * 6) + 94, // 94% - 99%
      summary,
      priority,
      duplicateDetection: {
        isDuplicateOrCluster,
        duplicateCount,
        relatedComplaintIds: relatedIds,
        clusterName: isDuplicateOrCluster ? `${existingComplaints[0]?.location.locality || 'Area'} Civic Cluster` : undefined,
        similarityScore: isDuplicateOrCluster ? maxSimilarity : 0,
      },
      estimatedImpact: impact,
      reason,
      recommendedAction: action,
      suggestedDepartment,
      slaHours,
      riskFactors,
      keywordsDetected: detectedKeywords.length > 0 ? detectedKeywords : [identifiedCategory.toLowerCase()],
      sentimentScore: sentiment,
      infrastructureVulnerability,
      isSimulated: true,
    };
  }
}
