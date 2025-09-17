// Soffit Calculator - JavaScript Implementation
// Orlando, Florida specific pricing and calculations

// Constants based on Orlando market research 2024
const LABOR_COST_PER_FOOT = 6.00; // $6 per linear foot
const FLORIDA_TAX_RATE = 0.065; // 6.5%

// Material costs per unit (12 ft pieces)
const MATERIAL_COSTS = {
  soffit_panel_aluminum: 22.00, // 16" Aluminum Ventilated Soffit per panel (~12 ft)
  soffit_panel_vinyl: 9.00, // Vinyl Soffit per sheet
  j_channel: 7.00, // 3/8" Aluminum J-Channel per piece (~12 ft)
  fascia_6: 17.00, // 6" Aluminum Fascia per piece (~12 ft) - Standard fascia
  nails: 13.00 // 1 7/8" Stainless Steel Nails per box
};

// Installation types
const INSTALLATION_TYPES = {
  soffit_fascia: {
    name: "Soffit and Fascia",
    description: "Complete installation with soffit panels and fascia",
    requires_fascia: true
  },
  double_j: {
    name: "Double J",
    description: "Soffit with J-channel only (no fascia replacement)",
    requires_fascia: false
  }
};

// Service type multipliers
const SERVICE_MULTIPLIERS = {
  remove_replace: 1.3,
  new_construction: 1.0,
  repair: 0.8
};

// Minimum cost for repair service
const REPAIR_MINIMUM_COST = 250.00;

// Material multipliers and info
const MATERIALS = {
  vinyl: {
    multiplier: 1.0,
    durability: 20,
    description: "Vinyl - Economical and low maintenance"
  },
  aluminum: {
    multiplier: 1.0, // Using actual material costs now
    durability: 30,
    description: "Aluminum - Durable and corrosion resistant"
  }
};

// Volume discount
const VOLUME_DISCOUNT_THRESHOLD = 290.0; // Changed from 200 to 290 feet
const VOLUME_DISCOUNT_RATE = 0.05; // 5%

// Validation limits
const MIN_HOUSE_DIMENSION = 10.0;
const MAX_HOUSE_DIMENSION = 500.0;
const MAX_GABLE_COUNT = 20;
const MIN_GABLE_LENGTH = 5.0;
const MAX_GABLE_LENGTH = 100.0;

export class SoffitCalculator {
  constructor() {
    this.laborCostPerFoot = LABOR_COST_PER_FOOT;
    this.taxRate = FLORIDA_TAX_RATE;
    this.materialCosts = MATERIAL_COSTS;
  }

  /**
   * Calculate material quantities based on linear feet and overhang
   */
  calculateMaterialQuantities(linearFeet, overhangFeet, installationType, materialType = 'aluminum') {
    const installation = INSTALLATION_TYPES[installationType] || INSTALLATION_TYPES.soffit_fascia;
    
    // Calculate soffit panels needed based on overhang
    // Aluminum panels are 16" wide, Vinyl panels are 12" wide
    const panelWidth = materialType === 'vinyl' ? 12/12 : 16/12; // Convert inches to feet
    const panelsPerFoot = Math.ceil(overhangFeet / panelWidth);
    const totalPanelsNeeded = Math.ceil((linearFeet * panelsPerFoot) / 12) * 12; // Round up to full panels
    
    // J-Channel: need for all linear feet (both sides for double J)
    const jChannelPieces = Math.ceil(linearFeet / 12) * (installationType === 'double_j' ? 2 : 1);
    
    // Fascia: only needed for soffit_fascia installation
    const fasciaPieces = installation.requires_fascia ? Math.ceil(linearFeet / 12) : 0;
    
    // Nails: estimate 1 box per 100 linear feet
    const nailBoxes = Math.ceil(linearFeet / 100);
    
    return {
      soffit_panels: Math.ceil(totalPanelsNeeded / 12),
      j_channel: jChannelPieces,
      fascia: fasciaPieces,
      nails: nailBoxes,
      installation_type: installation
    };
  }

  /**
   * Calculate complete cost estimate
   */
  calculateCostEstimate(linearFeet, overhangFeet, installationType, materialType, projectDetails) {
    const material = MATERIALS[materialType] || MATERIALS.aluminum;
    const quantities = this.calculateMaterialQuantities(linearFeet, overhangFeet, installationType, materialType);
    
    // Get service multiplier
    const serviceMultiplier = SERVICE_MULTIPLIERS[projectDetails.serviceType] || 1.0;
    
    // Calculate material costs based on material type
    const soffitPanelCost = materialType === 'vinyl' ? this.materialCosts.soffit_panel_vinyl : this.materialCosts.soffit_panel_aluminum;
    const soffitCost = quantities.soffit_panels * soffitPanelCost;
    const jChannelCost = quantities.j_channel * this.materialCosts.j_channel;
    const fasciaCost = quantities.fascia * this.materialCosts.fascia_6; // Always use 6" fascia (standard)
    const nailsCost = quantities.nails * this.materialCosts.nails;
    
    const baseMaterialCost = soffitCost + jChannelCost + fasciaCost + nailsCost;
    const baseLaborCost = linearFeet * this.laborCostPerFoot;
    
    // Apply service multiplier
    const materialCost = baseMaterialCost * serviceMultiplier;
    const laborCost = baseLaborCost * serviceMultiplier;
    
    const subtotal = materialCost + laborCost;
    
    // Apply volume discount if applicable
    const volumeDiscountApplied = linearFeet >= VOLUME_DISCOUNT_THRESHOLD;
    const discountAmount = volumeDiscountApplied ? subtotal * VOLUME_DISCOUNT_RATE : 0;
    const discountedTotal = subtotal - discountAmount;
    
    // Apply minimum cost for repair service
    let adjustedTotal = discountedTotal;
    if (projectDetails.serviceType === 'repair' && discountedTotal < REPAIR_MINIMUM_COST) {
      adjustedTotal = REPAIR_MINIMUM_COST;
    }
    
    // Calculate tax
    const taxAmount = adjustedTotal * this.taxRate;
    const finalTotal = adjustedTotal + taxAmount;
    
    return {
      materialCost,
      laborCost,
      totalCost: adjustedTotal,
      linearFeet,
      overhangFeet,
      quantities,
      taxRate: this.taxRate,
      taxAmount,
      finalTotal,
      volumeDiscountApplied,
      discountAmount,
      repairMinimumApplied: projectDetails.serviceType === 'repair' && discountedTotal < REPAIR_MINIMUM_COST,
      materialBreakdown: {
        soffit: soffitCost,
        jChannel: jChannelCost,
        fascia: fasciaCost,
        nails: nailsCost
      }
    };
  }

  /**
   * Calculate material option for selected type
   */
  calculateMaterialOptions(linearFeet, overhangFeet, installationType, materialType, projectDetails) {
    const estimate = this.calculateCostEstimate(linearFeet, overhangFeet, installationType, materialType, projectDetails);
    const material = MATERIALS[materialType];
    
    return [{
      material: {
        name: materialType,
        durabilityYears: material.durability,
        description: material.description
      },
      estimate,
      costPerYear: estimate.finalTotal / material.durability
    }];
  }

  /**
   * Validate measurements
   */
  validateMeasurements(linearFeet, overhangFeet) {
    const errors = [];
    
    if (linearFeet < MIN_HOUSE_DIMENSION) {
      errors.push(`Linear feet must be at least ${MIN_HOUSE_DIMENSION} feet`);
    }
    if (linearFeet > MAX_HOUSE_DIMENSION * 4) { // Allow for larger perimeters
      errors.push(`Linear feet cannot exceed ${MAX_HOUSE_DIMENSION * 4} feet`);
    }
    
    if (overhangFeet < 0.5) {
      errors.push(`Overhang must be at least 0.5 feet`);
    }
    if (overhangFeet > 10) {
      errors.push(`Overhang cannot exceed 10 feet`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate Florida ZIP code
   */
  validateZipCode(zipCode) {
    if (zipCode.length !== 5) return false;
    
    const zipNum = parseInt(zipCode);
    return zipNum >= 32000 && zipNum <= 34999;
  }

  /**
   * Format currency value
   */
  formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  /**
   * Get material information
   */
  getMaterialInfo(materialType) {
    const material = MATERIALS[materialType] || MATERIALS.aluminum;
    
    return {
      name: materialType,
      durabilityYears: material.durability,
      description: material.description
    };
  }

  /**
   * Get installation type information
   */
  getInstallationTypes() {
    return INSTALLATION_TYPES;
  }

  /**
   * Get material cost breakdown
   */
  getMaterialCosts() {
    return this.materialCosts;
  }
}

// Export for use in Astro components
export default SoffitCalculator;