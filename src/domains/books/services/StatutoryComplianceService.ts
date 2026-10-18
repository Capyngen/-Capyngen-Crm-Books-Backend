export interface IEPFCalculation {
  eligibleWages: number;
  employeePF: number;
  employerPF: number;
  employerEPS: number;
  employerEDLI: number;
  employerAdmin: number;
  totalEmployerContribution: number;
}

export interface IESICCalculation {
  isApplicable: boolean;
  grossWages: number;
  employeeESI: number;
  employerESI: number;
  totalESI: number;
}

export class StatutoryComplianceService {
  /**
   * Calculate Employee and Employer EPF contributions according to EPFO rules
   * @param basic Basic salary
   * @param useStatutoryCeiling Whether to cap at INR 15,000/month
   */
  static calculateEPF(basic: number, useStatutoryCeiling: boolean = true): IEPFCalculation {
    const ceiling = 15000;
    const eligibleWages = useStatutoryCeiling ? Math.min(basic, ceiling) : basic;
    const epsEligibleWages = Math.min(basic, ceiling); // EPS is strictly capped at 15000

    const employeePF = Math.round(eligibleWages * 0.12);
    const employerEPS = Math.round(epsEligibleWages * 0.0833); // 8.33% capped at 1250
    const employerPF = Math.max(0, Math.round(eligibleWages * 0.12) - employerEPS);
    const employerEDLI = Math.round(epsEligibleWages * 0.005); // 0.5% capped at 75
    const employerAdmin = Math.round(eligibleWages * 0.005); // 0.5%

    return {
      eligibleWages,
      employeePF,
      employerPF,
      employerEPS,
      employerEDLI,
      employerAdmin,
      totalEmployerContribution: employerPF + employerEPS + employerEDLI + employerAdmin
    };
  }

  /**
   * Calculate Employee and Employer ESIC contributions
   * Applicable if Gross monthly wages <= INR 21,000
   * @param grossSalary Monthly gross wages
   */
  static calculateESIC(grossSalary: number): IESICCalculation {
    const isApplicable = grossSalary > 0 && grossSalary <= 21000;

    if (!isApplicable) {
      return {
        isApplicable: false,
        grossWages: grossSalary,
        employeeESI: 0,
        employerESI: 0,
        totalESI: 0
      };
    }

    const employeeESI = Math.ceil(grossSalary * 0.0075); // 0.75% rounded up
    const employerESI = Math.ceil(grossSalary * 0.0325); // 3.25% rounded up

    return {
      isApplicable: true,
      grossWages: grossSalary,
      employeeESI,
      employerESI,
      totalESI: employeeESI + employerESI
    };
  }

  /**
   * Calculate State-wise Professional Tax (PT)
   * @param grossSalary Monthly gross wages
   * @param state Indian State (e.g. Maharashtra, Karnataka)
   * @param month Month (1-12) to handle Feb higher slab in MH
   */
  static calculateProfessionalTax(grossSalary: number, state: string = 'Maharashtra', month: number = 1): number {
    const normalizedState = (state || 'Maharashtra').trim().toLowerCase();

    if (normalizedState.includes('maharashtra')) {
      if (grossSalary <= 7500) return 0;
      if (grossSalary <= 10000) return 175;
      return month === 2 ? 300 : 200; // February is 300 in Maharashtra
    }

    if (normalizedState.includes('karnataka')) {
      if (grossSalary < 15000) return 0;
      return 200;
    }

    if (normalizedState.includes('tamil nadu')) {
      if (grossSalary <= 21000) return 0;
      if (grossSalary <= 30000) return 100;
      if (grossSalary <= 45000) return 235;
      if (grossSalary <= 60000) return 510;
      return 1025 / 6; // Bi-annual pro-rated monthly
    }

    if (normalizedState.includes('telangana') || normalizedState.includes('andhra')) {
      if (grossSalary <= 15000) return 0;
      if (grossSalary <= 20000) return 150;
      return 200;
    }

    if (normalizedState.includes('west bengal')) {
      if (grossSalary <= 10000) return 0;
      if (grossSalary <= 15000) return 110;
      if (grossSalary <= 25000) return 130;
      if (grossSalary <= 40000) return 150;
      return 200;
    }

    // Delhi, Haryana, UP default / no PT
    return 0;
  }

  /**
   * Generates EPFO electronic format ECR (Electronic Challan cum Return) text file
   * Standard EPFO structure: UAN#~#MemberName#~#Gross#~#EPF_Wages#~#EPS_Wages#~#EDLI_Wages#~#EE_Share#~#ER_Share#~#EPS_Share#~#NCP_Days#~#Refund
   */
  static generateEPF_ECRFile(payslips: any[]): string {
    const lines: string[] = [];

    for (const p of payslips) {
      const uan = p.uanNumber || p.statutoryDetails?.uanNumber || '000000000000';
      const name = p.employeeName || 'MEMBER';
      const gross = Math.round(p.grossSalary || 0);
      const epfBasic = Math.min(Math.round(p.basic || 0), 15000);
      const epsBasic = epfBasic;
      const edliBasic = epfBasic;
      const eeShare = Math.round(p.epfEmployee || 0);
      const erShare = Math.round(p.epfEmployer || 0);
      const epsShare = Math.round(epfBasic * 0.0833);
      const ncpDays = Math.max(0, Math.round(p.lopDays || 0));

      lines.push(`${uan}#~#${name}#~#${gross}#~#${epfBasic}#~#${epsBasic}#~#${edliBasic}#~#${eeShare}#~#${erShare}#~#${epsShare}#~#${ncpDays}#~#0`);
    }

    return lines.join('\r\n');
  }

  /**
   * Generates ESIC monthly return data format
   */
  static generateESICReturn(payslips: any[]): string {
    const header = 'IP_Number,IP_Name,Days_Worked,Total_Monthly_Wages,Reason_Code,Last_Working_Day';
    const rows = payslips
      .filter(p => (p.esiEmployee || 0) > 0 || (p.grossSalary || 0) <= 21000)
      .map(p => {
        const ipNum = p.esiNumber || p.statutoryDetails?.esiNumber || '0000000000';
        const name = (p.employeeName || 'Staff').replace(/,/g, '');
        const days = Math.round(p.presentDays || (p.totalWorkingDays - (p.lopDays || 0)));
        const gross = Math.round(p.grossSalary || 0);
        return `${ipNum},${name},${days},${gross},0,`;
      });

    return [header, ...rows].join('\r\n');
  }
}
