const { useState, useMemo, useEffect } = React;
const { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } = Recharts;

const LifePlanningApp = () => {
  // 金額フォーマット関数（1億以上は「x億y,yyy万円」形式）
  const formatAmount = (amountInManYen) => {
    // undefined, null, NaN をチェック
    if (amountInManYen == null || isNaN(amountInManYen)) {
      return '0万円';
    }
    
    const amount = Number(amountInManYen);
    
    if (amount >= 10000) {
      const oku = Math.floor(amount / 10000);
      const man = Math.round(amount % 10000);
      if (man === 0) {
        return `${oku}億円`;
      }
      return `${oku}億${man.toLocaleString()}万円`;
    }
    return `${Math.round(amount).toLocaleString()}万円`;
  };

  // 基本データ
  const [basicData, setBasicData] = useState({
    name: '',
    birthDate: '2000-08-03',
    currentAge: 25,
    hasRetirementBonus: true,
    hasSpouse: false,
    spouseBirthDate: '',
    spouseAge: 0,
    hasChildren: false,
    childrenCount: 0,
  });

  // 配偶者の収入期間設定
  const [spouseIncomePeriods, setSpouseIncomePeriods] = useState([
    { id: 1, startAge: 25, endAge: 65, type: 'fulltime', income: 20 }, // type: fulltime, parttime, housewife
  ]);

  // 現在の財務状況
  const [currentFinance, setCurrentFinance] = useState({
    // 収入
    primaryIncome1: 30,
    primaryIncome2: 0,
    salaryIncreaseRate: 1.0, // 昇給率（%）
    bonus: 0,
    sideIncome: 0,
    // 支出
    housing: 3.0,
    groceries: 2.0,
    snacks: 1.0,
    dining: 2.0,
    utilities: 2.0,
    communication: 1.0,
    insurance: 1.0,
    medical: 0.0,
    education: 0.0,
    carMaintenance: 0.0,
    transportation: 1.0,
    clothing: 1.0,
    entertainment: 3.0,
    socializing: 0.0,
    miscellaneous: 1.0,
    loans: 0.0,
    investment: 3.0,
    savings1: 0.0,
    savings2: 3.0,
    // 預金残高
    currentSavings: 100,
  });

  // 収入・支出の合計を計算
  const financeSummary = useMemo(() => {
    // 配偶者の現在の収入を計算（期間設定に基づく）
    let spouseCurrentIncome = 0;
    if (basicData.hasSpouse && basicData.spouseAge > 0) {
      const currentPeriod = spouseIncomePeriods.find(
        p => basicData.spouseAge >= p.startAge && basicData.spouseAge <= p.endAge
      );
      if (currentPeriod) {
        if (currentPeriod.type === 'fulltime') {
          spouseCurrentIncome = currentPeriod.income;
        } else if (currentPeriod.type === 'parttime') {
          spouseCurrentIncome = currentPeriod.income;
        } else if (currentPeriod.type === 'housewife') {
          spouseCurrentIncome = 0;
        }
      }
    }
    
    const totalIncome = currentFinance.primaryIncome1 + spouseCurrentIncome + 
                       currentFinance.bonus + currentFinance.sideIncome;
    const totalExpense = currentFinance.housing + currentFinance.groceries + currentFinance.snacks +
                        currentFinance.dining + currentFinance.utilities + currentFinance.communication +
                        currentFinance.insurance + currentFinance.medical + currentFinance.education +
                        currentFinance.carMaintenance + currentFinance.transportation + currentFinance.clothing +
                        currentFinance.entertainment + currentFinance.socializing + currentFinance.miscellaneous +
                        currentFinance.loans + currentFinance.investment + currentFinance.savings1 + 
                        currentFinance.savings2;
    const balance = totalIncome - totalExpense;
    
    return { totalIncome, totalExpense, balance, spouseIncome: spouseCurrentIncome };
  }, [currentFinance, basicData.hasSpouse, basicData.spouseAge, spouseIncomePeriods]);

  // 子供の情報
  const [children, setChildren] = useState([
    { id: 1, birthDate: '', age: 0, highSchoolType: 'public', universityType: 'public_science' }, // public_science, public_liberal, private_science, private_liberal
  ]);

  // 年齢設定
  const [ages, setAges] = useState({
    current: 25,
    retirement: 65,
    final: 95,
  });

  // ローン・融資関係
  const [loan, setLoan] = useState({
    startAge: 30,
    loanYears: 35,
    monthlyPayment: 0,
  });

  // 収入
  const [income, setIncome] = useState({
    pension: 10.7,
    pensionMonths: 12,
    pensionYears: 30,
    retirement: 600,
    realEstate: 0, // 後方互換性のため残す
    realEstateMonths: 12,
    hasRealEstate: false,
  });
  
  // 不動産収入（複数物件対応）
  const [realEstateProperties, setRealEstateProperties] = useState([
    { id: 1, monthlyIncome: 0, loanEndAge: 60 }
  ]);

  // 支出
  const [expenses, setExpenses] = useState({
    minRetirement: 28.2,
    minRetirementMonths: 12,
    minRetirementYears: 30,
    comfortableRetirement: 37.9,
    comfortableRetirementMonths: 12,
    comfortableRetirementYears: 30,
  });

  // 資産運用シミュレーション
  const [simulation, setSimulation] = useState({
    indexReturn: 4,
    activeReturn: 6.5,
    educationReturn: 3, // 教育資金の運用利回り
    inflationRate: 2, // インフレ率
  });

  // 生年月日から現在年齢を自動計算
  useEffect(() => {
    if (basicData.birthDate) {
      const birth = new Date(basicData.birthDate);
      const today = new Date('2026-02-13');
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      setBasicData(prev => ({ ...prev, currentAge: age }));
      setAges(prev => ({ ...prev, current: age }));
    }
  }, [basicData.birthDate]);

  // 配偶者の年齢を自動計算
  useEffect(() => {
    if (basicData.hasSpouse && basicData.spouseBirthDate) {
      const birth = new Date(basicData.spouseBirthDate);
      const today = new Date('2026-02-13');
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      setBasicData(prev => ({ ...prev, spouseAge: age }));
    }
  }, [basicData.hasSpouse, basicData.spouseBirthDate]);

  // 子供の年齢を自動計算
  useEffect(() => {
    if (basicData.hasChildren) {
      const today = new Date('2026-02-13');
      setChildren(prev => prev.map(child => {
        if (child.birthDate) {
          const birth = new Date(child.birthDate);
          let age = today.getFullYear() - birth.getFullYear();
          const monthDiff = today.getMonth() - birth.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
          }
          // 未来の子供の場合は負の年齢になる（例：-2は2年後に生まれる）
          return { ...child, age };
        }
        return child;
      }));
    }
  }, [basicData.hasChildren, children.map(c => c.birthDate).join(',')]);

  // 教育費計算（18歳まで、子供ごとの詳細）
  const educationCosts = useMemo(() => {
    if (!basicData.hasChildren) return { total: 0, children: [], summary: { total: 0, monthly: 0 } };
    
    // 教育費の目安（万円）- 小中は公立固定
    const educationCostTable = {
      elementary: 210,  // 小学校6年間（公立）
      juniorHigh: 150,  // 中学校3年間（公立）
      highSchool: {
        public: 140,    // 高校3年間（公立）
        private: 290,   // 高校3年間（私立）
      },
      university: {
        public_science: 400,    // 大学4年間（国公立・理系）
        public_liberal: 400,    // 大学4年間（国公立・文系）
        private_science: 800,   // 大学4年間（私立・理系）
        private_liberal: 700,   // 大学4年間（私立・文系）
      },
    };
    
    const childrenCosts = [];
    let grandTotal = 0;
    
    children.forEach((child, index) => {
      if (!child.birthDate) return;
      
      const currentAge = child.age;
      let childTotal = 0;
      const breakdown = [];
      
      // 未来生まれの子供の場合、現在の年齢は負の数
      // 18歳になるまでの年数を計算（未来生まれでも対応）
      const yearsUntil18 = 18 - currentAge;
      
      if (yearsUntil18 <= 0) {
        // すでに18歳以上なので教育費不要
        return;
      }
      
      // 小学校（6-12歳）
      if (currentAge < 12) {
        const startAge = Math.max(6, currentAge);
        const yearsInElementary = Math.max(0, 12 - startAge);
        const cost = (educationCostTable.elementary / 6) * yearsInElementary;
        if (yearsInElementary > 0) {
          childTotal += cost;
          breakdown.push({
            stage: '小学校',
            type: '公立',
            startAge,
            endAge: 12,
            years: yearsInElementary,
            cost,
          });
        }
      }
      
      // 中学校（12-15歳）
      if (currentAge < 15) {
        const startAge = Math.max(12, currentAge);
        const yearsInJuniorHigh = Math.max(0, 15 - startAge);
        const cost = (educationCostTable.juniorHigh / 3) * yearsInJuniorHigh;
        if (yearsInJuniorHigh > 0) {
          childTotal += cost;
          breakdown.push({
            stage: '中学校',
            type: '公立',
            startAge,
            endAge: 15,
            years: yearsInJuniorHigh,
            cost,
          });
        }
      }
      
      // 高校（15-18歳）
      if (currentAge < 18) {
        const startAge = Math.max(15, currentAge);
        const yearsInHighSchool = Math.max(0, 18 - startAge);
        const highSchoolType = child.highSchoolType || 'public';
        const cost = (educationCostTable.highSchool[highSchoolType] / 3) * yearsInHighSchool;
        if (yearsInHighSchool > 0) {
          childTotal += cost;
          breakdown.push({
            stage: '高校',
            type: highSchoolType === 'public' ? '公立' : '私立',
            startAge,
            endAge: 18,
            years: yearsInHighSchool,
            cost,
          });
        }
      }
      
      // 大学費用は18歳時点で必要（18歳未満の場合のみ計算）
      if (currentAge < 18) {
        const universityType = child.universityType || 'public_science';
        const baseCost = educationCostTable.university[universityType];
        
        // インフレ調整（現在から18歳までの期間）
        const inflationMultiplier = Math.pow(1 + simulation.inflationRate / 100, yearsUntil18);
        const universityCost = baseCost * inflationMultiplier;
        
        // タイプ表示用のラベル
        let typeLabel = '';
        if (universityType === 'public_science') typeLabel = '国公立・理系';
        else if (universityType === 'public_liberal') typeLabel = '国公立・文系';
        else if (universityType === 'private_science') typeLabel = '私立・理系';
        else if (universityType === 'private_liberal') typeLabel = '私立・文系';
        
        childTotal += universityCost;
        breakdown.push({
          stage: '大学',
          type: typeLabel,
          startAge: 18,
          endAge: 22,
          years: 4,
          cost: universityCost,
          baseCost: baseCost, // 基準額も保存
          inflationRate: simulation.inflationRate,
        });
      }
      
      // 月額積立額の計算（子供が18歳になるまで）
      const monthsUntil18 = yearsUntil18 * 12;
      let monthlyInvestment = 0;
      
      // 積立期間が正の値の場合のみ計算
      if (monthsUntil18 > 0 && childTotal > 0) {
        monthlyInvestment = childTotal / monthsUntil18;
      }
      
      childrenCosts.push({
        childIndex: index + 1,
        childAge: currentAge,
        yearsUntil18,
        total: childTotal,
        monthlyInvestment,
        breakdown,
      });
      
      grandTotal += childTotal;
    });
    
    // 全体のサマリー計算
    const summary = {
      total: grandTotal,
      // 最も遅く18歳になる子供までの期間で計算（最長の積立期間）
      maxYearsUntil18: Math.max(...childrenCosts.map(c => c.yearsUntil18), 0),
    };
    
    return {
      total: grandTotal,
      children: childrenCosts,
      summary,
    };
  }, [basicData.hasChildren, children]);

  // 計算結果
  const calculations = useMemo(() => {
    // 年金収入総額
    const totalPension = income.pension * income.pensionMonths * income.pensionYears;
    
    // 不動産収入総額（複数物件対応）
    const loanEndAge = loan.startAge + loan.loanYears;
    const realEstateStartAge = loanEndAge; // 後方互換性のため残す
    
    // 各物件の収入開始年齢（最も早いものを使用）
    const earliestRealEstateStartAge = income.hasRealEstate 
      ? Math.min(...realEstateProperties.map(p => p.loanEndAge))
      : realEstateStartAge;
    
    // 不動産収入の月額合計を計算する関数（年齢指定）
    const getRealEstateIncomeAtAge = (age) => {
      if (!income.hasRealEstate) return 0;
      return realEstateProperties.reduce((sum, property) => {
        if (age >= property.loanEndAge) {
          return sum + property.monthlyIncome;
        }
        return sum;
      }, 0);
    };
    
    // 不動産収入総額の正確な計算（複数物件対応）
    let retirementRealEstateYears = 0;
    let preRetirementRealEstateYears = 0;
    let realEstateYears = 0;
    let totalRealEstate = 0;
    let retirementRealEstateIncome = 0;
    
    if (income.hasRealEstate) {
      // 各物件の収入を年齢ごとに計算
      for (let age = ages.current; age <= ages.final; age++) {
        const incomeAtAge = realEstateProperties.reduce((sum, property) => {
          if (age >= property.loanEndAge) {
            return sum + property.monthlyIncome;
          }
          return sum;
        }, 0);
        
        const yearlyIncome = incomeAtAge * income.realEstateMonths;
        
        if (age >= ages.retirement) {
          // 老後期間の不動産収入
          retirementRealEstateIncome += yearlyIncome;
        }
        
        totalRealEstate += yearlyIncome;
      }
      
      realEstateYears = ages.final - earliestRealEstateStartAge;
    }
    
    // 総収入（年金 + 退職金 + 老後期間の不動産収入）
    const totalIncome = totalPension + income.retirement + retirementRealEstateIncome;
    
    // インフレ調整後の老後生活費
    const yearsUntilRetirement = ages.retirement - ages.current;
    const inflationMultiplier = Math.pow(1 + simulation.inflationRate / 100, yearsUntilRetirement);
    
    // 最低限の老後生活費総額（インフレ調整済み）
    const adjustedMinRetirement = expenses.minRetirement * inflationMultiplier;
    const totalMinExpenses = adjustedMinRetirement * expenses.minRetirementMonths * expenses.minRetirementYears;
    
    // ゆとりある老後生活費総額（インフレ調整済み）
    const adjustedComfortableRetirement = expenses.comfortableRetirement * inflationMultiplier;
    const totalComfortableExpenses = adjustedComfortableRetirement * expenses.comfortableRetirementMonths * expenses.comfortableRetirementYears;
    
    // 不足額計算（収入には年金・退職金・不動産収入すべて含む）
    const minShortfall = totalMinExpenses - totalIncome;
    const comfortableShortfall = totalComfortableExpenses - totalIncome;
    
    // 月額不足額
    const minMonthlyShortfall = minShortfall > 0 ? minShortfall / (expenses.minRetirementYears * 12) : 0;
    const comfortableMonthlyShortfall = comfortableShortfall > 0 ? comfortableShortfall / (expenses.comfortableRetirementYears * 12) : 0;
    
    // 月額積立必要額の計算（複利を考慮した将来価値の公式）
    // FV = PMT × [(1 + r)^n - 1] / r
    // PMT = FV × r / [(1 + r)^n - 1]
    const monthsToRetirement = yearsUntilRetirement * 12;
    
    // 最低限資金（アクティブ運用）の月額積立額
    const monthlyActiveRate = simulation.activeReturn / 100 / 12;
    const minMonthlyInvestment = Math.max(0, minShortfall) * 10000 * monthlyActiveRate / 
      (Math.pow(1 + monthlyActiveRate, monthsToRetirement) - 1);
    
    // ゆとり資金差額（インデックス運用）の月額積立額
    const monthlyIndexRate = simulation.indexReturn / 100 / 12;
    const comfortDiffShortfall = Math.max(0, comfortableShortfall - minShortfall);
    const comfortDiffMonthlyInvestment = comfortDiffShortfall * 10000 * monthlyIndexRate / 
      (Math.pow(1 + monthlyIndexRate, monthsToRetirement) - 1);
    
    return {
      totalPension,
      totalRealEstate,
      totalIncome,
      totalMinExpenses,
      totalComfortableExpenses,
      minShortfall: Math.max(0, minShortfall),
      comfortableShortfall: Math.max(0, comfortableShortfall),
      minMonthlyShortfall,
      comfortableMonthlyShortfall,
      loanEndAge,
      realEstateStartAge,
      realEstateYears,
      minMonthlyInvestment: minMonthlyInvestment / 10000, // 万円単位
      comfortDiffMonthlyInvestment: comfortDiffMonthlyInvestment / 10000, // 万円単位
      inflationMultiplier,
      adjustedMinRetirement,
      adjustedComfortableRetirement,
    };
  }, [income, expenses, ages, loan, simulation, realEstateProperties]);

  // 貯蓄残高データ生成（現在の収支と預金残高、教育費支出を反映）
  const savingsBalanceData = useMemo(() => {
    const data = [];
    const yearsToRetirement = ages.retirement - ages.current;
    const retirementYears = ages.final - ages.retirement;
    
    // 月額積立額（calculationsから取得）
    const monthlyMinInvestmentActive = calculations.minMonthlyInvestment;
    const monthlyComfortDiffInvestmentIndex = calculations.comfortDiffMonthlyInvestment;
    
    // 現在の月間収支（収入 - 支出）
    const monthlySurplus = financeSummary.balance;
    
    // 教育費の年間支出を計算する関数
    const calculateEducationExpense = (currentYear) => {
      if (!basicData.hasChildren) return 0;
      
      let yearlyExpense = 0;
      const educationCostTable = {
        elementary: 210 / 6,  // 年間35万円
        juniorHigh: 150 / 3,  // 年間50万円
        highSchool: {
          public: 140 / 3,    // 年間46.7万円
          private: 290 / 3,   // 年間96.7万円
        },
      };
      
      children.forEach(child => {
        if (!child.birthDate) return;
        const childAgeThisYear = child.age + currentYear;
        
        // 小学校（6-12歳）
        if (childAgeThisYear >= 6 && childAgeThisYear < 12) {
          yearlyExpense += educationCostTable.elementary;
        }
        // 中学校（12-15歳）
        else if (childAgeThisYear >= 12 && childAgeThisYear < 15) {
          yearlyExpense += educationCostTable.juniorHigh;
        }
        // 高校（15-18歳）
        else if (childAgeThisYear >= 15 && childAgeThisYear < 18) {
          const highSchoolType = child.highSchoolType || 'public';
          yearlyExpense += educationCostTable.highSchool[highSchoolType];
        }
      });
      
      return yearlyExpense;
    };
    
    // 配偶者の年齢別収入を計算する関数
    const getSpouseIncomeAtAge = (spouseAge) => {
      if (!basicData.hasSpouse || spouseAge <= 0) return 0;
      
      const period = spouseIncomePeriods.find(
        p => spouseAge >= p.startAge && spouseAge <= p.endAge
      );
      
      if (!period) return 0;
      
      if (period.type === 'housewife') return 0;
      return period.income || 0;
    };
    
    // 不動産収入の月額合計を計算する関数（年齢指定）
    const getRealEstateIncomeAtAge = (age) => {
      if (!income.hasRealEstate) return 0;
      return realEstateProperties.reduce((sum, property) => {
        if (age >= property.loanEndAge) {
          return sum + property.monthlyIncome;
        }
        return sum;
      }, 0);
    };
    
    // 年数に応じた主収入を計算する関数（昇給率を考慮）
    const getPrimaryIncomeAtYear = (year) => {
      const baseIncome = currentFinance.primaryIncome1;
      const increaseRate = currentFinance.salaryIncreaseRate / 100;
      return baseIncome * Math.pow(1 + increaseRate, year);
    };
    
    // 各年齢での教育資金の月額積立額を計算する関数
    const getEducationInvestmentAtAge = (age) => {
      if (!basicData.hasChildren) return 0;
      
      let totalMonthly = 0;
      educationCosts.children.forEach(childCost => {
        const u = childCost.breakdown.find(b => b.stage === '大学');
        if (!u || !u.cost || u.cost === 0) return;
        
        const childAge = childCost.childAge;
        const childAgeThisYear = childAge + (age - ages.current);
        
        // 0歳（または誕生時）から18歳未満の間のみ積立
        // 積立額は誕生時（または現在年齢）から18歳までの期間で計算した固定額
        if (childAgeThisYear >= 0 && childAgeThisYear < 18) {
          // 積立開始時の年齢（0歳または現在の年齢）
          const startAge = Math.max(0, childAge);
          // 積立期間（年）
          const investmentYears = 18 - startAge;
          const investmentMonths = investmentYears * 12;
          
          if (investmentMonths > 0) {
            const r = simulation.educationReturn / 100 / 12;
            const d = Math.pow(1 + r, investmentMonths) - 1;
            if (d > 0) {
              // 積立開始時に計算した月額を使用（毎年変わらない）
              const monthlyAmount = u.cost * 10000 * r / d / 10000;
              totalMonthly += monthlyAmount;
            }
          }
        }
      });
      
      return totalMonthly;
    };
    
    // 現役時代（積立期）
    let minActiveBalance = 0;
    let comfortIndexBalance = 0;
    let generalSavings = currentFinance.currentSavings; // 現在の預金残高からスタート
    
    for (let year = 0; year <= yearsToRetirement; year++) {
      const age = ages.current + year;
      const spouseAge = basicData.hasSpouse ? basicData.spouseAge + year : 0;
      
      // この年の配偶者収入
      const spouseIncomeThisYear = getSpouseIncomeAtAge(spouseAge);
      
      // この年の主収入（昇給率を考慮）
      const primaryIncomeThisYear = getPrimaryIncomeAtYear(year);
      
      const totalIncomeThisYear = primaryIncomeThisYear + spouseIncomeThisYear + 
                                  currentFinance.bonus + currentFinance.sideIncome;
      
      if (year === 0) {
        // 初年度（現在）
        data.push({
          age: age,
          ageLabel: `${age}歳`,
          year: year,
          phase: '現役時代',
          最低限_アクティブ: 0,
          ゆとり差額_インデックス: 0,
          一般預金: Math.round(generalSavings * 10) / 10,
          合計残高: Math.round(generalSavings * 10) / 10,
          // 詳細情報
          月間収入: totalIncomeThisYear,
          月間支出: financeSummary.totalExpense,
          月間収支: totalIncomeThisYear - financeSummary.totalExpense,
          教育費支出: 0,
          投資額: monthlyMinInvestmentActive + monthlyComfortDiffInvestmentIndex,
          老後投資額: monthlyMinInvestmentActive + monthlyComfortDiffInvestmentIndex,
          教育投資額: getEducationInvestmentAtAge(age),
          配偶者年齢: spouseAge,
          配偶者収入: spouseIncomeThisYear,
        });
      } else {
        // 月複利計算
        const monthlyActiveReturn = simulation.activeReturn / 100 / 12;
        const monthlyIndexReturn = simulation.indexReturn / 100 / 12;
        
        // この年の教育費支出
        const yearlyEducationExpense = calculateEducationExpense(year);
        
        // この年の月間収支（収入から支出を引く）
        const monthlySurplusThisYear = totalIncomeThisYear - financeSummary.totalExpense;
        
        // 1年間（12ヶ月）の複利計算
        for (let month = 1; month <= 12; month++) {
          // 投資用資金の運用（万円単位）
          minActiveBalance = minActiveBalance * (1 + monthlyActiveReturn) + monthlyMinInvestmentActive;
          comfortIndexBalance = comfortIndexBalance * (1 + monthlyIndexReturn) + monthlyComfortDiffInvestmentIndex;
          
          // 一般預金の増減（月間収支から投資額と教育費を引く）
          const monthlyEducationExpense = yearlyEducationExpense / 12;
          const monthlyToInvestments = monthlyMinInvestmentActive + monthlyComfortDiffInvestmentIndex;
          generalSavings = generalSavings + monthlySurplusThisYear - monthlyToInvestments - monthlyEducationExpense;
        }
        
        const totalBalance = minActiveBalance + comfortIndexBalance + generalSavings;
        
        data.push({
          age: age,
          ageLabel: `${age}歳`,
          year: year,
          phase: '現役時代',
          最低限_アクティブ: Math.round(minActiveBalance * 10) / 10,
          ゆとり差額_インデックス: Math.round(comfortIndexBalance * 10) / 10,
          一般預金: Math.round(generalSavings * 10) / 10,
          合計残高: Math.round(totalBalance * 10) / 10,
          // 詳細情報
          月間収入: totalIncomeThisYear,
          月間支出: financeSummary.totalExpense,
          月間収支: totalIncomeThisYear - financeSummary.totalExpense,
          教育費支出: Math.round(yearlyEducationExpense * 10) / 10,
          投資額: monthlyMinInvestmentActive + monthlyComfortDiffInvestmentIndex,
          老後投資額: monthlyMinInvestmentActive + monthlyComfortDiffInvestmentIndex,
          教育投資額: getEducationInvestmentAtAge(age),
          配偶者年齢: spouseAge,
          配偶者収入: spouseIncomeThisYear,
        });
      }
    }
    
    // 老後時代（取崩期）- インフレ調整済み支出
    let retirementMinBalance = minActiveBalance;
    let retirementComfortBalance = comfortIndexBalance;
    let retirementGeneralSavings = generalSavings;
    
    for (let year = 1; year <= retirementYears; year++) {
      const age = ages.retirement + year;
      const spouseAge = basicData.hasSpouse ? (basicData.spouseAge + (age - ages.current)) : 0;
      
      // この年の配偶者収入（退職後でも働いている場合）
      const spouseIncomeThisYear = getSpouseIncomeAtAge(spouseAge);
      
      // この年の不動産収入（複数物件の合計）
      const realEstateIncomeThisYear = getRealEstateIncomeAtAge(age);
      
      // 月額収支
      const monthlyPension = income.pension;
      const monthlyRealEstate = realEstateIncomeThisYear;
      const monthlyIncome = monthlyPension + monthlyRealEstate + spouseIncomeThisYear;
      
      // インフレ調整済みの支出
      const monthlyMinExpense = calculations.adjustedMinRetirement;
      const monthlyComfortExpense = calculations.adjustedComfortableRetirement;
      
      // 年間の取崩額
      const yearlyMinShortfall = (monthlyMinExpense - monthlyIncome) * 12;
      const yearlyComfortShortfall = (monthlyComfortExpense - monthlyIncome) * 12;
      const yearlyComfortDiffShortfall = yearlyComfortShortfall - yearlyMinShortfall;
      
      // 残高更新（マイナスにならないように）
      retirementMinBalance = Math.max(0, retirementMinBalance - yearlyMinShortfall);
      retirementComfortBalance = Math.max(0, retirementComfortBalance - yearlyComfortDiffShortfall);
      
      // 一般預金も老後の生活費補填に使用
      const totalShortfall = Math.max(0, yearlyComfortShortfall - (retirementMinBalance + retirementComfortBalance > 0 ? 0 : yearlyComfortShortfall));
      retirementGeneralSavings = Math.max(0, retirementGeneralSavings - totalShortfall);
      
      const totalBalance = retirementMinBalance + retirementComfortBalance + retirementGeneralSavings;
      
      data.push({
        age: age,
        ageLabel: `${age}歳`,
        year: yearsToRetirement + year,
        phase: '老後時代',
        最低限_アクティブ: Math.round(retirementMinBalance * 10) / 10,
        ゆとり差額_インデックス: Math.round(retirementComfortBalance * 10) / 10,
        一般預金: Math.round(retirementGeneralSavings * 10) / 10,
        合計残高: Math.round(totalBalance * 10) / 10,
        // 詳細情報
        月間収入: monthlyIncome,
        月間支出: monthlyComfortExpense,
        月間収支: monthlyIncome - monthlyComfortExpense,
        教育費支出: 0,
        投資額: 0,
        老後投資額: 0,
        教育投資額: 0,
        配偶者年齢: spouseAge,
        配偶者収入: spouseIncomeThisYear,
      });
    }
    
    return data;
  }, [ages, income, expenses, calculations, simulation, currentFinance, financeSummary, basicData.hasChildren, children, realEstateProperties, educationCosts]);

  // 資産運用シミュレーションデータ（複利計算修正版）
  const investmentData = useMemo(() => {
    const data = [];
    const yearsToRetirement = ages.retirement - ages.current;
    
    // 月額積立額（calculationsから取得）
    const monthlyMinInvestmentActive = calculations.minMonthlyInvestment;
    const monthlyComfortDiffInvestmentIndex = calculations.comfortDiffMonthlyInvestment;
    
    // 最低限資金のアクティブ運用
    let minActiveBalance = 0;
    // ゆとり差額のインデックス運用
    let comfortDiffIndexBalance = 0;
    
    for (let year = 0; year <= yearsToRetirement; year++) {
      const age = ages.current + year;
      
      if (year === 0) {
        // 初年度
        data.push({
          age: `${age}歳`,
          year: year,
          最低限_アクティブ: 0,
          ゆとり差額_インデックス: 0,
        });
      } else {
        // 月複利計算
        const monthlyActiveReturn = simulation.activeReturn / 100 / 12;
        const monthlyIndexReturn = simulation.indexReturn / 100 / 12;
        
        // 1年間（12ヶ月）の複利計算
        for (let month = 1; month <= 12; month++) {
          // 前月の残高に利息を加算し、今月の積立を追加（単位：万円）
          minActiveBalance = minActiveBalance * (1 + monthlyActiveReturn) + monthlyMinInvestmentActive;
          comfortDiffIndexBalance = comfortDiffIndexBalance * (1 + monthlyIndexReturn) + monthlyComfortDiffInvestmentIndex;
        }
        
        data.push({
          age: `${age}歳`,
          year: year,
          最低限_アクティブ: Math.round(minActiveBalance * 10) / 10,
          ゆとり差額_インデックス: Math.round(comfortDiffIndexBalance * 10) / 10,
        });
      }
    }
    
    return data;
  }, [ages, calculations, simulation]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 relative overflow-hidden">
      {/* 背景の装飾要素 */}
      <div className="fixed inset-0 pointer-events-none opacity-30">
        <div className="absolute top-20 right-10 w-64 h-64 bg-pink-200 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-orange-200 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-yellow-200 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative max-w-5xl mx-auto px-4 py-6">
        {/* ヘッダー */}
        <div className="relative bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400 overflow-hidden mb-12">
          {/* 幾何学模様の背景 */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-10 left-10 w-32 h-32 border-4 border-white rounded-full"></div>
            <div className="absolute top-20 right-20 w-24 h-24 bg-white/30 transform rotate-45"></div>
            <div className="absolute bottom-10 left-1/4 w-16 h-16 bg-pink-300/40 rounded-full"></div>
            <div className="absolute bottom-20 right-1/3 w-20 h-20 border-4 border-orange-300/50"></div>
            <div className="absolute top-1/2 left-1/2 w-12 h-12 bg-yellow-200/30 transform -translate-x-1/2 -translate-y-1/2"></div>
          </div>
          
          {/* ドットパターン */}
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)',
            backgroundSize: '30px 30px'
          }}></div>
          
          <div className="relative max-w-4xl mx-auto px-6 py-16 text-center">
            <div className="inline-block mb-4">
              <div className="text-5xl font-bold text-white drop-shadow-lg" style={{
                textShadow: '3px 3px 0px rgba(0,0,0,0.1)'
              }}>
                Unicara Life Planning
              </div>
              <div className="mt-2 h-1 bg-white/50 rounded-full"></div>
            </div>
            <p className="text-lg text-white/95 font-medium mt-4">
              あなたの未来を、楽しく設計しよう ✨
            </p>
          </div>
        </div>

        {/* 基本データ入力 */}
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-8 border-2 border-emerald-200 relative overflow-hidden">
          {/* カード装飾 */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-pink-100 rounded-full -mr-16 -mt-16 opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-100 transform rotate-45 -ml-12 -mb-12 opacity-50"></div>
          
          <div className="relative flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform">
              <span className="text-white text-2xl">📝</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">基本データ</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">名前</label>
              <input
                type="text"
                value={basicData.name}
                onChange={(e) => setBasicData({...basicData, name: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="お名前を入力"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">生年月日</label>
              <input
                type="date"
                value={basicData.birthDate}
                onChange={(e) => setBasicData({...basicData, birthDate: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
              <div className="text-sm text-gray-500 mt-1">現在の年齢: {basicData.currentAge}歳</div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">退職金</label>
              <select
                value={basicData.hasRetirementBonus ? 'あり' : 'なし'}
                onChange={(e) => setBasicData({...basicData, hasRetirementBonus: e.target.value === 'あり'})}
                className="w-full px-4 py-2 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option>あり</option>
                <option>なし</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">配偶者</label>
              <select
                value={basicData.hasSpouse ? 'あり' : 'なし'}
                onChange={(e) => setBasicData({...basicData, hasSpouse: e.target.value === 'あり'})}
                className="w-full px-4 py-2 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option>なし</option>
                <option>あり</option>
              </select>
            </div>
          </div>

          {/* 配偶者情報 */}
          {basicData.hasSpouse && (
            <div className="mb-6 p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
              <h3 className="text-lg font-bold text-pink-800 mb-3">配偶者情報</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">配偶者の生年月日</label>
                  <input
                    type="date"
                    value={basicData.spouseBirthDate}
                    onChange={(e) => setBasicData({...basicData, spouseBirthDate: e.target.value})}
                    className="w-full px-4 py-2 border border-emerald-300 rounded-2xl focus:ring-2 focus:ring-pink-500"
                  />
                  <div className="text-sm text-gray-500 mt-1">配偶者の年齢: {basicData.spouseAge}歳</div>
                </div>
              </div>
            </div>
          )}

          {/* 子供情報 */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">子供</label>
            <select
              value={basicData.hasChildren ? 'あり' : 'なし'}
              onChange={(e) => {
                const hasChildren = e.target.value === 'あり';
                setBasicData({...basicData, hasChildren});
                if (!hasChildren) {
                  setChildren([{ id: 1, birthDate: '', age: 0, educationType: 'public' }]);
                }
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              <option>なし</option>
              <option>あり</option>
            </select>
          </div>

          {basicData.hasChildren && (
            <div className="mb-6 p-4 bg-blue-50 rounded-2xl border border-blue-200">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-bold text-blue-800">子供の情報</h3>
                <button
                  onClick={() => {
                    const newId = children.length > 0 ? Math.max(...children.map(c => c.id)) + 1 : 1;
                    setChildren([...children, { id: newId, birthDate: '', age: 0, highSchoolType: 'public', universityType: 'public' }]);
                  }}
                  className="px-3 py-1 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 text-sm font-semibold"
                >
                  + 子供を追加
                </button>
              </div>
              
              <div className="space-y-4">
                {children.map((child, index) => (
                  <div key={child.id} className="p-4 bg-white rounded-2xl border border-blue-300">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-bold text-gray-700">第{index + 1}子</span>
                      {children.length > 1 && (
                        <button
                          onClick={() => setChildren(children.filter(c => c.id !== child.id))}
                          className="text-red-600 hover:text-emerald-800 text-sm font-semibold"
                        >
                          削除
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">生年月日</label>
                        <input
                          type="date"
                          value={child.birthDate}
                          onChange={(e) => {
                            setChildren(children.map(c => 
                              c.id === child.id ? { ...c, birthDate: e.target.value } : c
                            ));
                          }}
                          className="w-full px-3 py-2 border border-blue-300 rounded text-sm"
                        />
                        {child.age !== 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            {child.age > 0 ? (
                              <>現在 {child.age}歳 {child.age < 18 && `→ ${18 - child.age}年後に18歳`}</>
                            ) : (
                              <>誕生予定: {Math.abs(child.age)}年後 → {18 + Math.abs(child.age)}年後に18歳</>
                            )}
                            {child.age >= 18 && ' （18歳以上のため教育費不要）'}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">高校（15-18歳）</label>
                        <select
                          value={child.highSchoolType}
                          onChange={(e) => {
                            setChildren(children.map(c => 
                              c.id === child.id ? { ...c, highSchoolType: e.target.value } : c
                            ));
                          }}
                          className="w-full px-3 py-2 border border-blue-300 rounded text-sm"
                        >
                          <option value="public">公立高校</option>
                          <option value="private">私立高校</option>
                        </select>
                        <div className="text-xs text-gray-500 mt-1">
                          公立: 140万円 / 私立: 290万円
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">大学（18-22歳）</label>
                        <select
                          value={child.universityType}
                          onChange={(e) => {
                            setChildren(children.map(c => 
                              c.id === child.id ? { ...c, universityType: e.target.value } : c
                            ));
                          }}
                          className="w-full px-3 py-2 border border-blue-300 rounded text-sm"
                        >
                          <option value="public_science">国公立大学（理系）</option>
                          <option value="public_liberal">国公立大学（文系）</option>
                          <option value="private_science">私立大学（理系）</option>
                          <option value="private_liberal">私立大学（文系）</option>
                        </select>
                        <div className="text-xs text-gray-500 mt-1">
                          国公立: 400万円 / 私立理系: 800万円 / 私立文系: 700万円
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                      ※ 小学校・中学校は公立固定（小学校: 210万円、中学校: 150万円）
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 年齢タイムライン */}
          <div className="bg-gradient-to-r from-indigo-50 to-teal-50 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-2">現在の年齢</div>
                <div className="bg-white rounded-2xl shadow-md p-4">
                  <div className="text-3xl font-bold">{ages.current}</div>
                  <div className="text-sm text-gray-500">歳</div>
                </div>
              </div>
              
              <div className="flex-1 mx-4">
                <div className="h-2 bg-gradient-to-r from-indigo-400 to-teal-400 rounded-full"></div>
                <div className="flex justify-center mt-2">
                  <div className="text-center bg-white rounded-2xl px-4 py-2 shadow-md">
                    <div className="text-xl font-bold">{ages.retirement - ages.current}</div>
                    <div className="text-xs text-gray-600">投資期間(年)</div>
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-2">老後開始年齢</div>
                <div className="bg-white rounded-2xl shadow-md p-4">
                  <div className="text-3xl font-bold">{ages.retirement}</div>
                  <div className="text-sm text-gray-500">歳</div>
                </div>
                <div className="mt-2 w-48">
                  <input
                    type="range"
                    min="50"
                    max="70"
                    value={ages.retirement}
                    onChange={(e) => {
                      const newRetirement = parseInt(e.target.value);
                      const retirementYears = ages.final - newRetirement;
                      setAges({...ages, retirement: newRetirement});
                      setExpenses({...expenses, minRetirementYears: retirementYears, comfortableRetirementYears: retirementYears});
                      setIncome({...income, pensionYears: retirementYears});
                    }}
                    className="w-full h-2 bg-emerald-200 rounded-2xl appearance-none cursor-pointer accent-purple-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>50歳</span>
                    <span>70歳</span>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 mx-4">
                <div className="h-2 bg-gradient-to-r from-emerald-400 to-pink-400 rounded-full"></div>
                <div className="flex justify-center mt-2">
                  <div className="text-center bg-white rounded-2xl px-4 py-2 shadow-md">
                    <div className="text-xl font-bold">{ages.final - ages.retirement}</div>
                    <div className="text-xs text-gray-600">老後期間(年)</div>
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-2">終身年齢</div>
                <div className="bg-white rounded-2xl shadow-md p-4">
                  <div className="text-3xl font-bold">{ages.final}</div>
                  <div className="text-sm text-gray-500">歳</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 現在の財務状況 */}
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-8 border-2 border-emerald-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-emerald-500 pb-2">現在の財務状況（月間収支計算）</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 収入セクション */}
            <div className="bg-blue-50 rounded-2xl p-5 border-2 border-blue-200">
              <h3 className="text-lg font-bold text-blue-800 mb-4 flex items-center gap-2">
                <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">収</span>
                収入
              </h3>
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2 items-center">
                  <label className="text-sm font-semibold text-gray-700 col-span-2">主収入①（本人の給与）</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="0.1"
                      value={currentFinance.primaryIncome1}
                      onChange={(e) => setCurrentFinance({...currentFinance, primaryIncome1: parseFloat(e.target.value) || 0})}
                      className="w-full px-2 py-1 border border-blue-300 rounded text-right"
                    />
                    <span className="text-xs text-gray-600">万円</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 items-center bg-blue-50 p-2 rounded-2xl">
                  <label className="text-sm font-semibold text-gray-700 col-span-2">　└ 昇給率（年率）</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="0.1"
                      value={currentFinance.salaryIncreaseRate}
                      onChange={(e) => setCurrentFinance({...currentFinance, salaryIncreaseRate: parseFloat(e.target.value) || 0})}
                      className="w-full px-2 py-1 border border-blue-300 rounded text-right"
                    />
                    <span className="text-xs text-gray-600">%</span>
                  </div>
                </div>
                
                {/* 配偶者収入の期間設定 */}
                {basicData.hasSpouse && (
                  <div className="bg-white rounded-2xl p-4 border-2 border-blue-300">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-semibold text-gray-700">主収入②（配偶者）期間設定</label>
                      <button
                        onClick={() => setSpouseIncomePeriods([...spouseIncomePeriods, {
                          id: Date.now(),
                          startAge: basicData.spouseAge || 25,
                          endAge: 65,
                          type: 'fulltime',
                          income: 20
                        }])}
                        className="px-3 py-1 bg-blue-500 text-white text-xs rounded-2xl hover:bg-blue-600"
                      >
                        + 期間追加
                      </button>
                    </div>
                    
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {spouseIncomePeriods.map((period, index) => (
                        <div key={period.id} className="bg-blue-50 rounded-2xl p-3 border border-blue-200">
                          <div className="grid grid-cols-4 gap-2 mb-2">
                            <div>
                              <label className="text-xs text-gray-600">開始年齢</label>
                              <input
                                type="number"
                                value={period.startAge}
                                onChange={(e) => {
                                  const updated = [...spouseIncomePeriods];
                                  updated[index].startAge = parseInt(e.target.value) || 0;
                                  setSpouseIncomePeriods(updated);
                                }}
                                className="w-full px-2 py-1 text-sm border border-blue-300 rounded"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-600">終了年齢</label>
                              <input
                                type="number"
                                value={period.endAge}
                                onChange={(e) => {
                                  const updated = [...spouseIncomePeriods];
                                  updated[index].endAge = parseInt(e.target.value) || 0;
                                  setSpouseIncomePeriods(updated);
                                }}
                                className="w-full px-2 py-1 text-sm border border-blue-300 rounded"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-600">雇用形態</label>
                              <select
                                value={period.type}
                                onChange={(e) => {
                                  const updated = [...spouseIncomePeriods];
                                  updated[index].type = e.target.value;
                                  setSpouseIncomePeriods(updated);
                                }}
                                className="w-full px-2 py-1 text-sm border border-blue-300 rounded"
                              >
                                <option value="fulltime">正社員</option>
                                <option value="parttime">パート</option>
                                <option value="housewife">主婦/主夫</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-xs text-gray-600">月収（万円）</label>
                              <input
                                type="number"
                                step="0.1"
                                value={period.income}
                                onChange={(e) => {
                                  const updated = [...spouseIncomePeriods];
                                  updated[index].income = parseFloat(e.target.value) || 0;
                                  setSpouseIncomePeriods(updated);
                                }}
                                className="w-full px-2 py-1 text-sm border border-blue-300 rounded"
                                disabled={period.type === 'housewife'}
                              />
                            </div>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-600">
                              {period.startAge}歳～{period.endAge}歳: {
                                period.type === 'fulltime' ? '正社員' :
                                period.type === 'parttime' ? 'パート' : '主婦/主夫'
                              } ({period.type === 'housewife' ? '0' : period.income}万円/月)
                            </span>
                            <button
                              onClick={() => setSpouseIncomePeriods(spouseIncomePeriods.filter(p => p.id !== period.id))}
                              className="text-red-500 hover:text-red-700"
                            >
                              削除
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 text-xs text-blue-600">
                      現在の配偶者収入: {financeSummary.spouseIncome}万円/月
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-3 gap-2 items-center">
                  <label className="text-sm font-semibold text-gray-700 col-span-2">賞与（ボーナス/月換算）</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="0.1"
                      value={currentFinance.bonus}
                      onChange={(e) => setCurrentFinance({...currentFinance, bonus: parseFloat(e.target.value) || 0})}
                      className="w-full px-2 py-1 border border-blue-300 rounded text-right"
                    />
                    <span className="text-xs text-gray-600">万円</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 items-center">
                  <label className="text-sm font-semibold text-gray-700 col-span-2">副収入（副業）</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="0.1"
                      value={currentFinance.sideIncome}
                      onChange={(e) => setCurrentFinance({...currentFinance, sideIncome: parseFloat(e.target.value) || 0})}
                      className="w-full px-2 py-1 border border-blue-300 rounded text-right"
                    />
                    <span className="text-xs text-gray-600">万円</span>
                  </div>
                </div>
                
                <div className="pt-3 mt-3 border-t-2 border-blue-300">
                  <div className="flex justify-between items-center p-2 bg-blue-100 rounded-2xl">
                    <span className="font-bold text-gray-700">合計</span>
                    <span className="text-2xl font-bold text-blue-700">{financeSummary.totalIncome.toFixed(1)} 万円</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 支出セクション */}
            <div className="bg-emerald-50 rounded-2xl p-5 border-2 border-emerald-200">
              <h3 className="text-lg font-bold text-emerald-800 mb-4 flex items-center gap-2">
                <span className="bg-emerald-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">支</span>
                支出
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                {/* 消費 */}
                <div className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded">消費</div>
                <div className="grid grid-cols-3 gap-2 items-center text-sm">
                  <label className="text-gray-700 col-span-2">住居費</label>
                  <div className="flex items-center gap-1">
                    <input type="number" step="0.1" value={currentFinance.housing} 
                      onChange={(e) => setCurrentFinance({...currentFinance, housing: parseFloat(e.target.value) || 0})}
                      className="w-full px-2 py-1 border border-emerald-200 rounded text-right text-sm" />
                    <span className="text-xs text-gray-600">万円</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 items-center text-sm">
                  <label className="text-gray-700 col-span-2">家庭食</label>
                  <div className="flex items-center gap-1">
                    <input type="number" step="0.1" value={currentFinance.groceries}
                      onChange={(e) => setCurrentFinance({...currentFinance, groceries: parseFloat(e.target.value) || 0})}
                      className="w-full px-2 py-1 border border-emerald-200 rounded text-right text-sm" />
                    <span className="text-xs text-gray-600">万円</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 items-center text-sm">
                  <label className="text-gray-700 col-span-2">嗜好品</label>
                  <div className="flex items-center gap-1">
                    <input type="number" step="0.1" value={currentFinance.snacks}
                      onChange={(e) => setCurrentFinance({...currentFinance, snacks: parseFloat(e.target.value) || 0})}
                      className="w-full px-2 py-1 border border-emerald-200 rounded text-right text-sm" />
                    <span className="text-xs text-gray-600">万円</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 items-center text-sm">
                  <label className="text-gray-700 col-span-2">外食</label>
                  <div className="flex items-center gap-1">
                    <input type="number" step="0.1" value={currentFinance.dining}
                      onChange={(e) => setCurrentFinance({...currentFinance, dining: parseFloat(e.target.value) || 0})}
                      className="w-full px-2 py-1 border border-emerald-200 rounded text-right text-sm" />
                    <span className="text-xs text-gray-600">万円</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 items-center text-sm">
                  <label className="text-gray-700 col-span-2">水道光熱費</label>
                  <div className="flex items-center gap-1">
                    <input type="number" step="0.1" value={currentFinance.utilities}
                      onChange={(e) => setCurrentFinance({...currentFinance, utilities: parseFloat(e.target.value) || 0})}
                      className="w-full px-2 py-1 border border-emerald-200 rounded text-right text-sm" />
                    <span className="text-xs text-gray-600">万円</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 items-center text-sm">
                  <label className="text-gray-700 col-span-2">通信費</label>
                  <div className="flex items-center gap-1">
                    <input type="number" step="0.1" value={currentFinance.communication}
                      onChange={(e) => setCurrentFinance({...currentFinance, communication: parseFloat(e.target.value) || 0})}
                      className="w-full px-2 py-1 border border-emerald-200 rounded text-right text-sm" />
                    <span className="text-xs text-gray-600">万円</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 items-center text-sm">
                  <label className="text-gray-700 col-span-2">保険費</label>
                  <div className="flex items-center gap-1">
                    <input type="number" step="0.1" value={currentFinance.insurance}
                      onChange={(e) => setCurrentFinance({...currentFinance, insurance: parseFloat(e.target.value) || 0})}
                      className="w-full px-2 py-1 border border-emerald-200 rounded text-right text-sm" />
                    <span className="text-xs text-gray-600">万円</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 items-center text-sm">
                  <label className="text-gray-700 col-span-2">医療・衛生費</label>
                  <div className="flex items-center gap-1">
                    <input type="number" step="0.1" value={currentFinance.medical}
                      onChange={(e) => setCurrentFinance({...currentFinance, medical: parseFloat(e.target.value) || 0})}
                      className="w-full px-2 py-1 border border-emerald-200 rounded text-right text-sm" />
                    <span className="text-xs text-gray-600">万円</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 items-center text-sm">
                  <label className="text-gray-700 col-span-2">教育費</label>
                  <div className="flex items-center gap-1">
                    <input type="number" step="0.1" value={currentFinance.education}
                      onChange={(e) => setCurrentFinance({...currentFinance, education: parseFloat(e.target.value) || 0})}
                      className="w-full px-2 py-1 border border-emerald-200 rounded text-right text-sm" />
                    <span className="text-xs text-gray-600">万円</span>
                  </div>
                </div>
                
                {/* 浪費 */}
                <div className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded mt-2">浪費</div>
                <div className="grid grid-cols-3 gap-2 items-center text-sm">
                  <label className="text-gray-700 col-span-2">車両費</label>
                  <div className="flex items-center gap-1">
                    <input type="number" step="0.1" value={currentFinance.carMaintenance}
                      onChange={(e) => setCurrentFinance({...currentFinance, carMaintenance: parseFloat(e.target.value) || 0})}
                      className="w-full px-2 py-1 border border-emerald-200 rounded text-right text-sm" />
                    <span className="text-xs text-gray-600">万円</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 items-center text-sm">
                  <label className="text-gray-700 col-span-2">交通費</label>
                  <div className="flex items-center gap-1">
                    <input type="number" step="0.1" value={currentFinance.transportation}
                      onChange={(e) => setCurrentFinance({...currentFinance, transportation: parseFloat(e.target.value) || 0})}
                      className="w-full px-2 py-1 border border-emerald-200 rounded text-right text-sm" />
                    <span className="text-xs text-gray-600">万円</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 items-center text-sm">
                  <label className="text-gray-700 col-span-2">被服費</label>
                  <div className="flex items-center gap-1">
                    <input type="number" step="0.1" value={currentFinance.clothing}
                      onChange={(e) => setCurrentFinance({...currentFinance, clothing: parseFloat(e.target.value) || 0})}
                      className="w-full px-2 py-1 border border-emerald-200 rounded text-right text-sm" />
                    <span className="text-xs text-gray-600">万円</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 items-center text-sm">
                  <label className="text-gray-700 col-span-2">娯楽費</label>
                  <div className="flex items-center gap-1">
                    <input type="number" step="0.1" value={currentFinance.entertainment}
                      onChange={(e) => setCurrentFinance({...currentFinance, entertainment: parseFloat(e.target.value) || 0})}
                      className="w-full px-2 py-1 border border-emerald-200 rounded text-right text-sm" />
                    <span className="text-xs text-gray-600">万円</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 items-center text-sm">
                  <label className="text-gray-700 col-span-2">交際費</label>
                  <div className="flex items-center gap-1">
                    <input type="number" step="0.1" value={currentFinance.socializing}
                      onChange={(e) => setCurrentFinance({...currentFinance, socializing: parseFloat(e.target.value) || 0})}
                      className="w-full px-2 py-1 border border-emerald-200 rounded text-right text-sm" />
                    <span className="text-xs text-gray-600">万円</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 items-center text-sm">
                  <label className="text-gray-700 col-span-2">雑費</label>
                  <div className="flex items-center gap-1">
                    <input type="number" step="0.1" value={currentFinance.miscellaneous}
                      onChange={(e) => setCurrentFinance({...currentFinance, miscellaneous: parseFloat(e.target.value) || 0})}
                      className="w-full px-2 py-1 border border-emerald-200 rounded text-right text-sm" />
                    <span className="text-xs text-gray-600">万円</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 items-center text-sm">
                  <label className="text-gray-700 col-span-2">借金・ローン</label>
                  <div className="flex items-center gap-1">
                    <input type="number" step="0.1" value={currentFinance.loans}
                      onChange={(e) => setCurrentFinance({...currentFinance, loans: parseFloat(e.target.value) || 0})}
                      className="w-full px-2 py-1 border border-emerald-200 rounded text-right text-sm" />
                    <span className="text-xs text-gray-600">万円</span>
                  </div>
                </div>
                
                {/* 投資・預金 */}
                <div className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded mt-2">投資・預金</div>
                <div className="grid grid-cols-3 gap-2 items-center text-sm">
                  <label className="text-gray-700 col-span-2">投資（確定拠出年金等）</label>
                  <div className="flex items-center gap-1">
                    <input type="number" step="0.1" value={currentFinance.investment}
                      onChange={(e) => setCurrentFinance({...currentFinance, investment: parseFloat(e.target.value) || 0})}
                      className="w-full px-2 py-1 border border-emerald-200 rounded text-right text-sm" />
                    <span className="text-xs text-gray-600">万円</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 items-center text-sm">
                  <label className="text-gray-700 col-span-2">預金①（学資預金等）</label>
                  <div className="flex items-center gap-1">
                    <input type="number" step="0.1" value={currentFinance.savings1}
                      onChange={(e) => setCurrentFinance({...currentFinance, savings1: parseFloat(e.target.value) || 0})}
                      className="w-full px-2 py-1 border border-emerald-200 rounded text-right text-sm" />
                    <span className="text-xs text-gray-600">万円</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 items-center text-sm">
                  <label className="text-gray-700 col-span-2">預金②（銀行預金）</label>
                  <div className="flex items-center gap-1">
                    <input type="number" step="0.1" value={currentFinance.savings2}
                      onChange={(e) => setCurrentFinance({...currentFinance, savings2: parseFloat(e.target.value) || 0})}
                      className="w-full px-2 py-1 border border-emerald-200 rounded text-right text-sm" />
                    <span className="text-xs text-gray-600">万円</span>
                  </div>
                </div>
                
                <div className="pt-3 mt-3 border-t-2 border-emerald-300">
                  <div className="flex justify-between items-center p-2 bg-emerald-100 rounded-2xl">
                    <span className="font-bold text-gray-700">合計</span>
                    <span className="text-2xl font-bold text-emerald-700">{financeSummary.totalExpense.toFixed(1)} 万円</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* サマリー */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-100 rounded-2xl border-2 border-blue-300">
              <div className="text-sm text-gray-600 mb-1">月間収入</div>
              <div className="text-3xl font-bold text-blue-700">{financeSummary.totalIncome.toFixed(1)}</div>
              <div className="text-sm text-gray-600">万円</div>
            </div>
            
            <div className="p-4 bg-emerald-100 rounded-2xl border-2 border-emerald-300">
              <div className="text-sm text-gray-600 mb-1">月間支出</div>
              <div className="text-3xl font-bold text-emerald-700">{financeSummary.totalExpense.toFixed(1)}</div>
              <div className="text-sm text-gray-600">万円</div>
            </div>
            
            <div className={`p-4 rounded-2xl border-2 ${financeSummary.balance >= 0 ? 'bg-emerald-100 border-emerald-300' : 'bg-emerald-100 border-emerald-300'}`}>
              <div className="text-sm text-gray-600 mb-1">収支（黒字）</div>
              <div className={`text-3xl font-bold ${financeSummary.balance >= 0 ? 'text-emerald-700' : 'text-emerald-700'}`}>
                {financeSummary.balance >= 0 ? '+' : ''}{financeSummary.balance.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">万円</div>
              <div className="text-xs text-gray-500 mt-2">
                ※ この金額が毎月一般預金に積み立てられます
              </div>
            </div>
          </div>
          
          {/* 現在の預金残高 */}
          <div className="mt-4 p-4 bg-emerald-50 rounded-2xl border-2 border-indigo-200">
            <label className="block text-sm font-semibold text-gray-700 mb-2">現在の預金残高</label>
            <div className="flex items-center gap-4">
              <input
                type="number"
                step="10"
                value={currentFinance.currentSavings}
                onChange={(e) => setCurrentFinance({...currentFinance, currentSavings: parseFloat(e.target.value) || 0})}
                className="flex-1 px-4 py-3 text-2xl font-bold border-2 border-indigo-300 rounded-2xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
              <span className="text-xl font-semibold text-gray-600">万円</span>
            </div>
          </div>
        </div>

        {/* インフレ率設定 */}
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-8 border-2 border-emerald-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 pb-3 border-b-2 border-emerald-500">インフレ率設定</h2>
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-lg font-bold text-gray-800 mb-2">想定インフレ率（年率）</div>
                <div className="text-sm text-gray-600">老後の生活費がインフレにより上昇することを考慮します</div>
              </div>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={simulation.inflationRate}
                  onChange={(e) => setSimulation({...simulation, inflationRate: parseFloat(e.target.value) || 0})}
                  className="w-24 px-4 py-3 text-3xl font-bold border-2 border-emerald-400 rounded-2xl focus:ring-2 focus:ring-cyan-500 text-center"
                />
                <span className="text-3xl font-bold text-emerald-700">%</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="bg-white rounded-2xl p-4">
                <div className="text-xs text-gray-600 mb-1">退職まで</div>
                <div className="text-xl font-bold text-gray-800">{ages.retirement - ages.current}年</div>
              </div>
              <div className="bg-white rounded-2xl p-4">
                <div className="text-xs text-gray-600 mb-1">インフレ累積</div>
                <div className="text-xl font-bold text-emerald-700">{((calculations.inflationMultiplier - 1) * 100).toFixed(1)}%</div>
              </div>
              <div className="bg-white rounded-2xl p-4">
                <div className="text-xs text-gray-600 mb-1">調整後の老後生活費（月額）</div>
                <div className="text-sm text-gray-600">
                  最低限: {calculations.adjustedMinRetirement.toFixed(1)}万円<br/>
                  ゆとり: {calculations.adjustedComfortableRetirement.toFixed(1)}万円
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 収入・支出入力 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* 収入 */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-white bg-blue-600 px-4 py-2 rounded-2xl mb-4">収入</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">年金（月額）</label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="1"
                    max="25"
                    step="0.1"
                    value={income.pension}
                    onChange={(e) => setIncome({...income, pension: parseFloat(e.target.value)})}
                    className="w-full h-2 bg-blue-200 rounded-2xl appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">1万円</span>
                    <div className="text-center">
                      <span className="text-2xl font-bold text-blue-600">{income.pension.toFixed(1)}</span>
                      <span className="text-sm text-gray-600 ml-1">万円/月</span>
                    </div>
                    <span className="text-sm text-gray-500">25万円</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                  <span>×</span>
                  <input
                    type="number"
                    value={income.pensionMonths}
                    onChange={(e) => setIncome({...income, pensionMonths: parseInt(e.target.value) || 0})}
                    className="w-20 px-2 py-1 border border-gray-300 rounded"
                  />
                  <span>ヶ月 ×</span>
                  <input
                    type="number"
                    value={income.pensionYears}
                    onChange={(e) => setIncome({...income, pensionYears: parseInt(e.target.value) || 0})}
                    className="w-20 px-2 py-1 border border-gray-300 rounded"
                  />
                  <span>年</span>
                  <span className="font-bold text-blue-600">=</span>
                  <span className="font-bold text-lg text-blue-600">{(income.pension * income.pensionMonths * income.pensionYears).toLocaleString()}</span>
                  <span className="text-sm text-gray-600">万円</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">退職金</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={income.retirement}
                    onChange={(e) => setIncome({...income, retirement: parseFloat(e.target.value) || 0})}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">万円</span>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-semibold text-gray-700 bg-blue-100 px-3 py-1 rounded">不動産収入</label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={income.hasRealEstate}
                      onChange={(e) => setIncome({...income, hasRealEstate: e.target.checked})}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">あり</span>
                  </label>
                </div>
                
                {income.hasRealEstate && (
                  <div className="space-y-3 bg-blue-50 p-4 rounded-2xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-gray-700">物件情報</span>
                      <button
                        onClick={() => setRealEstateProperties([...realEstateProperties, {
                          id: Date.now(),
                          monthlyIncome: 0,
                          loanEndAge: 60
                        }])}
                        className="px-3 py-1 bg-blue-500 text-white text-xs rounded-2xl hover:bg-blue-600"
                      >
                        + 物件追加
                      </button>
                    </div>
                    
                    {realEstateProperties.map((property, index) => (
                      <div key={property.id} className="bg-white p-3 rounded-2xl border-2 border-blue-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-bold text-blue-700">物件{index + 1}</span>
                          {realEstateProperties.length > 1 && (
                            <button
                              onClick={() => setRealEstateProperties(realEstateProperties.filter(p => p.id !== property.id))}
                              className="text-red-500 text-xs hover:text-red-700"
                            >
                              削除
                            </button>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">家賃収入（月額）</label>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                step="0.1"
                                value={property.monthlyIncome}
                                onChange={(e) => {
                                  const updated = [...realEstateProperties];
                                  updated[index].monthlyIncome = parseFloat(e.target.value) || 0;
                                  setRealEstateProperties(updated);
                                }}
                                className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                              <span className="text-xs text-gray-600">万円/月</span>
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">ローン完済年齢</label>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={property.loanEndAge}
                                onChange={(e) => {
                                  const updated = [...realEstateProperties];
                                  updated[index].loanEndAge = parseInt(e.target.value) || 0;
                                  setRealEstateProperties(updated);
                                }}
                                className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                              <span className="text-xs text-gray-600">歳</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {property.loanEndAge}歳から収入開始
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <div className="border-t pt-2 mt-2">
                      <div className="text-xs text-gray-600">不動産収入合計（月額）</div>
                      <div className="text-lg font-bold text-blue-600">
                        {realEstateProperties.reduce((sum, p) => sum + p.monthlyIncome, 0).toFixed(1)} 万円/月
                      </div>
                      <div className="text-xs text-gray-500">
                        最速{Math.min(...realEstateProperties.map(p => p.loanEndAge))}歳から収入開始
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 支出 */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-white bg-emerald-600 px-4 py-2 rounded-2xl mb-4">支出</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">最低限の老後生活費</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={expenses.minRetirement}
                    onChange={(e) => setExpenses({...expenses, minRetirement: parseFloat(e.target.value) || 0})}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-cyan-500"
                  />
                  <span className="text-sm text-gray-600">万円 ×</span>
                  <input
                    type="number"
                    value={expenses.minRetirementMonths}
                    onChange={(e) => setExpenses({...expenses, minRetirementMonths: parseInt(e.target.value) || 0})}
                    className="w-20 px-4 py-2 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-cyan-500"
                  />
                  <span className="text-sm text-gray-600">ヶ月 ×</span>
                  <input
                    type="number"
                    value={expenses.minRetirementYears}
                    onChange={(e) => setExpenses({...expenses, minRetirementYears: parseInt(e.target.value) || 0})}
                    className="w-20 px-4 py-2 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-cyan-500"
                  />
                  <span className="text-sm text-gray-600">年</span>
                  <span className="font-bold text-red-600">=</span>
                  <span className="font-bold text-lg text-red-600">{(expenses.minRetirement * expenses.minRetirementMonths * expenses.minRetirementYears).toLocaleString()}</span>
                  <span className="text-sm text-gray-600">万円</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">ゆとりある老後生活費</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={expenses.comfortableRetirement}
                    onChange={(e) => setExpenses({...expenses, comfortableRetirement: parseFloat(e.target.value) || 0})}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-cyan-500"
                  />
                  <span className="text-sm text-gray-600">万円 ×</span>
                  <input
                    type="number"
                    value={expenses.comfortableRetirementMonths}
                    onChange={(e) => setExpenses({...expenses, comfortableRetirementMonths: parseInt(e.target.value) || 0})}
                    className="w-20 px-4 py-2 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-cyan-500"
                  />
                  <span className="text-sm text-gray-600">ヶ月 ×</span>
                  <input
                    type="number"
                    value={expenses.comfortableRetirementYears}
                    onChange={(e) => setExpenses({...expenses, comfortableRetirementYears: parseInt(e.target.value) || 0})}
                    className="w-20 px-4 py-2 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-cyan-500"
                  />
                  <span className="text-sm text-gray-600">年</span>
                  <span className="font-bold text-red-600">=</span>
                  <span className="font-bold text-lg text-red-600">{(expenses.comfortableRetirement * expenses.comfortableRetirementMonths * expenses.comfortableRetirementYears).toLocaleString()}</span>
                  <span className="text-sm text-gray-600">万円</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 計算結果サマリー */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* 老後必要資金 */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">老後必要資金</h2>
            {simulation.inflationRate > 0 && (
              <div className="mb-3 p-2 bg-emerald-50 rounded text-xs text-gray-600">
                ※ インフレ率{simulation.inflationRate}%を考慮した金額です（{ages.retirement - ages.current}年後の価値）
              </div>
            )}
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-2xl">
                <span className="font-semibold text-gray-700">最低限の老後生活費</span>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-700">{Math.round(calculations.totalMinExpenses).toLocaleString()}</div>
                  <div className="text-xs text-gray-600">万円（総額）</div>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-2xl">
                <span className="font-semibold text-gray-700">ゆとりある老後生活費</span>
                <div className="text-right">
                  <div className="text-2xl font-bold text-emerald-700">{Math.round(calculations.totalComfortableExpenses).toLocaleString()}</div>
                  <div className="text-xs text-gray-600">万円（総額）</div>
                </div>
              </div>
            </div>
          </div>

          {/* 不足額 */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-white bg-emerald-600 px-4 py-2 rounded-2xl mb-4">不足</h2>
            
            {/* 収入サマリー */}
            <div className="mb-4 p-3 bg-blue-50 rounded-2xl border border-blue-200">
              <div className="text-sm font-semibold text-gray-700 mb-2">老後期間の収入合計</div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">年金収入:</span>
                  <span className="font-semibold">{Math.round(calculations.totalPension).toLocaleString()} 万円</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">退職金:</span>
                  <span className="font-semibold">{(income.retirement || 0).toLocaleString()} 万円</span>
                </div>
                {income.hasRealEstate && (
                  <div className="flex justify-between text-emerald-700">
                    <span className="font-semibold">不動産収入:</span>
                    <span className="font-bold">{Math.round(calculations.totalRealEstate).toLocaleString()} 万円</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-blue-300">
                  <span className="font-bold text-gray-700">合計:</span>
                  <span className="font-bold text-blue-700">{Math.round(calculations.totalIncome).toLocaleString()} 万円</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 rounded-2xl border-2 border-emerald-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-gray-700">最低限の老後生活費</span>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">{Math.round(calculations.totalMinExpenses).toLocaleString()} 万円 - {Math.round(calculations.totalIncome).toLocaleString()} 万円 =</div>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <span className="text-3xl font-bold text-red-600">
                    {calculations.minShortfall > 0 ? '▲' : '✓'}{Math.round(calculations.minShortfall).toLocaleString()}
                  </span>
                  <span className="text-lg text-gray-600">万円</span>
                </div>
                {calculations.minShortfall > 0 ? (
                  <div className="text-right text-red-600 font-semibold mt-1">
                    {calculations.minMonthlyShortfall.toFixed(1)} 万円/月が不足
                  </div>
                ) : (
                  <div className="text-right text-red-600 font-semibold mt-1">
                    ✓ 資金は足りています
                  </div>
                )}
              </div>
              
              <div className="p-4 bg-emerald-50 rounded-2xl border-2 border-emerald-300">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-gray-700">ゆとりある老後生活費</span>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">{Math.round(calculations.totalComfortableExpenses).toLocaleString()} 万円 - {Math.round(calculations.totalIncome).toLocaleString()} 万円 =</div>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <span className="text-3xl font-bold text-emerald-700">
                    {calculations.comfortableShortfall > 0 ? '▲' : '✓'}{Math.round(calculations.comfortableShortfall).toLocaleString()}
                  </span>
                  <span className="text-lg text-gray-600">万円</span>
                </div>
                {calculations.comfortableShortfall > 0 ? (
                  <div className="text-right text-emerald-700 font-semibold mt-1">
                    {calculations.comfortableMonthlyShortfall.toFixed(1)} 万円/月が不足
                  </div>
                ) : (
                  <div className="text-right text-red-600 font-semibold mt-1">
                    ✓ 資金は足りています
                  </div>
                )}
              </div>
              
              {/* 教育資金 */}
              {basicData.hasChildren && educationCosts.total > 0 && (
                <div className="p-4 bg-orange-50 rounded-2xl border-2 border-orange-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-700">教育資金（全子供分）</span>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-3xl font-bold text-orange-600">
                      ▲{Math.round(educationCosts.total).toLocaleString()}
                    </span>
                    <span className="text-lg text-gray-600">万円</span>
                  </div>
                  <div className="text-right text-orange-600 font-semibold mt-1">
                    18歳までに必要
                  </div>
                  <div className="mt-3 pt-3 border-t border-orange-300">
                    <div className="text-xs text-gray-600 space-y-1">
                      {educationCosts.children.map((childCost) => (
                        <div key={childCost.childIndex} className="flex justify-between">
                          <span>第{childCost.childIndex}子:</span>
                          <span className="font-semibold">{Math.round(childCost.total).toLocaleString()} 万円</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 貯蓄残高推移グラフ */}
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-8 border-2 border-emerald-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">貯蓄残高の推移シミュレーション</h2>
          <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-teal-50 rounded-2xl">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-semibold">現役時代: </span>
                <span className="text-gray-600">毎月積立で資産形成（投資期間 {ages.retirement - ages.current}年）</span>
              </div>
              <div>
                <span className="font-semibold">一般預金: </span>
                <span className="text-gray-600">月間収支{financeSummary.balance.toFixed(1)}万円 - 投資額{(calculations.minMonthlyInvestment + calculations.comfortDiffMonthlyInvestment).toFixed(1)}万円 - 教育費</span>
              </div>
              <div>
                <span className="font-semibold">老後時代: </span>
                <span className="text-gray-600">年金+不動産収入で取り崩し（老後期間 {ages.final - ages.retirement}年）</span>
              </div>
            </div>
            {basicData.hasChildren && (
              <div className="mt-2 text-xs text-red-600 font-semibold">
                ※ 小中高の教育費は一般預金から毎年支出として引かれます（大学費用は別途積立）
              </div>
            )}
            <div className="mt-2 text-xs text-blue-600 font-semibold">
              ※ 月間収支のプラス分から、アクティブ・インデックス投資への積立額を差し引いた残りが一般預金に貯まります
            </div>
          </div>
          <ResponsiveContainer width="100%" height={450}>
            <AreaChart data={savingsBalanceData}>
              <defs>
                <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                </linearGradient>
                <linearGradient id="colorIndex" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.3}/>
                </linearGradient>
                <linearGradient id="colorGeneral" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.3}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="ageLabel" 
                interval={Math.floor(savingsBalanceData.length / 15)}
              />
              <YAxis label={{ value: '万円', angle: -90, position: 'insideLeft' }} />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-4 border border-gray-300 rounded-2xl shadow-lg">
                        <p className="font-bold mb-2">{payload[0].payload.ageLabel} ({payload[0].payload.phase})</p>
                        <p className="text-red-600">最低限（アクティブ）: {formatAmount(payload[0].payload.最低限_アクティブ)}</p>
                        <p className="text-blue-600">ゆとり差額（インデックス）: {formatAmount(payload[0].payload.ゆとり差額_インデックス)}</p>
                        <p className="text-red-600">一般預金: {formatAmount(payload[0].payload.一般預金)}</p>
                        <p className="text-gray-800 font-bold mt-1 pt-1 border-t">合計: {formatAmount(payload[0].payload.合計残高)}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="一般預金" 
                stackId="1"
                stroke="#10b981" 
                fillOpacity={1} 
                fill="url(#colorGeneral)" 
                strokeWidth={2}
                name="一般預金（月間収支の積立）"
              />
              <Area 
                type="monotone" 
                dataKey="最低限_アクティブ" 
                stackId="1"
                stroke="#8b5cf6" 
                fillOpacity={1} 
                fill="url(#colorActive)" 
                strokeWidth={2}
                name="最低限の生活（アクティブ/保険）"
              />
              <Area 
                type="monotone" 
                dataKey="ゆとり差額_インデックス" 
                stackId="1"
                stroke="#3b82f6" 
                fillOpacity={1} 
                fill="url(#colorIndex)" 
                strokeWidth={2}
                name="ゆとりの差額（インデックス/NISA）"
              />
            </AreaChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-4 gap-4">
            <div className="p-4 bg-emerald-50 rounded-2xl">
              <div className="text-sm text-gray-600 mb-1">{ages.retirement}歳時点 - 一般預金</div>
              <div className="text-2xl font-bold text-red-600">
                {formatAmount(savingsBalanceData.find(d => d.age === ages.retirement)?.一般預金 || 0)}
              </div>
            </div>
            <div className="p-4 bg-emerald-50 rounded-2xl">
              <div className="text-sm text-gray-600 mb-1">{ages.retirement}歳時点 - アクティブ</div>
              <div className="text-2xl font-bold text-red-600">
                {formatAmount(savingsBalanceData.find(d => d.age === ages.retirement)?.最低限_アクティブ || 0)}
              </div>
            </div>
            <div className="p-4 bg-blue-50 rounded-2xl">
              <div className="text-sm text-gray-600 mb-1">{ages.retirement}歳時点 - インデックス</div>
              <div className="text-2xl font-bold text-blue-600">
                {formatAmount(savingsBalanceData.find(d => d.age === ages.retirement)?.ゆとり差額_インデックス || 0)}
              </div>
            </div>
            <div className="p-4 bg-emerald-50 rounded-2xl">
              <div className="text-sm text-gray-600 mb-1">{ages.retirement}歳時点 - 合計</div>
              <div className="text-2xl font-bold text-emerald-700">
                {formatAmount(savingsBalanceData.find(d => d.age === ages.retirement)?.合計残高 || 0)}
              </div>
            </div>
          </div>
          
          {/* キャッシュフロー表 */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">📊 詳細キャッシュフロー表（95歳まで）</h3>
              <button
                onClick={() => {
                  const showTable = document.getElementById('cf-table');
                  if (showTable.style.display === 'none') {
                    showTable.style.display = 'block';
                  } else {
                    showTable.style.display = 'none';
                  }
                }}
                className="px-4 py-2 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 transition-colors"
              >
                表示/非表示
              </button>
            </div>
            
            <div id="cf-table" style={{display: 'none'}}>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                    <tr>
                      <th className="border border-emerald-300 px-2 py-2 sticky left-0 bg-emerald-500">年齢</th>
                      <th className="border border-emerald-300 px-2 py-2">フェーズ</th>
                      <th className="border border-emerald-300 px-2 py-2">月間収入</th>
                      <th className="border border-emerald-300 px-2 py-2">月間支出</th>
                      <th className="border border-emerald-300 px-2 py-2">月間収支</th>
                      <th className="border border-emerald-300 px-2 py-2">教育費支出<br/>(年間)</th>
                      <th className="border border-emerald-300 px-2 py-2">老後投資<br/>(月額)</th>
                      <th className="border border-emerald-300 px-2 py-2">教育投資<br/>(月額)</th>
                      <th className="border border-emerald-300 px-2 py-2">一般預金</th>
                      <th className="border border-emerald-300 px-2 py-2">アクティブ</th>
                      <th className="border border-emerald-300 px-2 py-2">インデックス</th>
                      <th className="border border-emerald-300 px-2 py-2 font-bold">合計残高</th>
                    </tr>
                  </thead>
                  <tbody>
                    {savingsBalanceData.map((row, index) => (
                      <tr 
                        key={index} 
                        className={`
                          ${index % 2 === 0 ? 'bg-white' : 'bg-emerald-50'}
                          ${row.age === ages.retirement ? 'bg-yellow-100 font-bold' : ''}
                          hover:bg-emerald-100 transition-colors
                        `}
                      >
                        <td className="border border-emerald-200 px-2 py-1 text-center font-semibold sticky left-0 bg-inherit">
                          {row.age}歳
                        </td>
                        <td className="border border-emerald-200 px-2 py-1 text-center">
                          <span className={`px-1 py-0.5 rounded-full text-xs ${
                            row.phase === '現役時代' 
                              ? 'bg-blue-100 text-blue-700' 
                              : 'bg-orange-100 text-orange-700'
                          }`}>
                            {row.phase}
                          </span>
                        </td>
                        <td className="border border-emerald-200 px-2 py-1 text-right text-blue-600">
                          {row.月間収入?.toFixed(1) || '-'}
                        </td>
                        <td className="border border-emerald-200 px-2 py-1 text-right text-red-600">
                          {row.月間支出?.toFixed(1) || '-'}
                        </td>
                        <td className={`border border-emerald-200 px-2 py-1 text-right font-semibold ${
                          (row.月間収支 || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {row.月間収支?.toFixed(1) || '-'}
                        </td>
                        <td className="border border-emerald-200 px-2 py-1 text-right text-orange-600">
                          {row.教育費支出 > 0 ? row.教育費支出.toFixed(1) : '-'}
                        </td>
                        <td className="border border-emerald-200 px-2 py-1 text-right text-purple-600">
                          {row.老後投資額 > 0 ? row.老後投資額.toFixed(1) : '-'}
                        </td>
                        <td className="border border-emerald-200 px-2 py-1 text-right text-orange-600">
                          {row.教育投資額 > 0 ? row.教育投資額.toFixed(1) : '-'}
                        </td>
                        <td className="border border-emerald-200 px-2 py-1 text-right">
                          {row.一般預金.toLocaleString()}
                        </td>
                        <td className="border border-emerald-200 px-2 py-1 text-right text-purple-700">
                          {row.最低限_アクティブ.toLocaleString()}
                        </td>
                        <td className="border border-emerald-200 px-2 py-1 text-right text-blue-700">
                          {row.ゆとり差額_インデックス.toLocaleString()}
                        </td>
                        <td className="border border-emerald-200 px-2 py-1 text-right font-bold text-emerald-700">
                          {row.合計残高.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="font-semibold text-gray-700 mb-1">📌 凡例</div>
                    <div className="text-gray-600">
                      • 黄色ハイライト: 退職年齢<br/>
                      • 青ラベル: 現役時代（積立期）<br/>
                      • オレンジラベル: 老後時代（取崩期）
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-700 mb-1">💡 見方</div>
                    <div className="text-gray-600">
                      各年齢時点での資産残高を表示<br/>
                      現役時代は積立により増加<br/>
                      老後時代は取崩により減少
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-700 mb-1">⚠️ 注意</div>
                    <div className="text-gray-600">
                      インフレ率{simulation.inflationRate}%を考慮<br/>
                      教育費は別途考慮済み<br/>
                      運用成績は保証されません
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 資産運用シミュレーション */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">資産運用シミュレーション</h2>
          {basicData.hasChildren && educationCosts.total > 0 && (
            <div className="mb-4 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-gray-300">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-xs text-gray-600">老後資金必要額</div>
                  <div className="text-lg font-bold text-emerald-700">
                    {(calculations.minMonthlyInvestment + calculations.comfortDiffMonthlyInvestment).toFixed(1)} 万円/月
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-600">教育費必要額</div>
                  <div className="text-lg font-bold text-emerald-700">
                    {educationCosts.children.reduce((sum, c) => {
                      const investment = c.monthlyInvestment || 0;
                      return sum + (isNaN(investment) ? 0 : investment);
                    }, 0).toFixed(1)} 万円/月
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-600 font-bold">合計必要額</div>
                  <div className="text-2xl font-bold text-emerald-700">
                    {(calculations.minMonthlyInvestment + calculations.comfortDiffMonthlyInvestment + 
                      educationCosts.children.reduce((sum, c) => {
                        const investment = c.monthlyInvestment || 0;
                        return sum + (isNaN(investment) ? 0 : investment);
                      }, 0)).toFixed(1)} 万円/月
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-emerald-50 rounded-2xl p-6 border-2 border-emerald-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-emerald-800">最低限の生活のための必要資金</h3>
                <div className="bg-emerald-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                  アクティブ（保険）
                </div>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-white rounded-2xl border border-emerald-200">
                  <div className="text-xs text-gray-600 mb-1">老後生活費総額</div>
                  <div className="text-lg font-bold text-gray-700">{Math.round(calculations.totalMinExpenses).toLocaleString()} 万円</div>
                </div>
                <div className="p-3 bg-white rounded-2xl border border-emerald-200">
                  <div className="text-xs text-gray-600 mb-1">収入総額（年金+退職金{income.hasRealEstate ? '+不動産' : ''}）</div>
                  <div className="text-lg font-bold text-blue-700">- {Math.round(calculations.totalIncome).toLocaleString()} 万円</div>
                  {income.hasRealEstate && calculations.totalRealEstate > 0 && (
                    <div className="text-xs text-red-600 mt-1">（うち不動産: {Math.round(calculations.totalRealEstate).toLocaleString()} 万円）</div>
                  )}
                </div>
                <div className="flex items-center justify-between p-3 bg-emerald-100 rounded-2xl border-2 border-emerald-300">
                  <span className="text-sm font-semibold text-gray-700">必要資金総額</span>
                  <span className="text-xl font-bold text-emerald-700">{Math.round(calculations.minShortfall).toLocaleString()} 万円</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-2xl">
                  <span className="text-sm font-semibold text-gray-700">投資期間</span>
                  <span className="text-xl font-bold text-emerald-700">{ages.retirement - ages.current} 年</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-2xl">
                  <span className="text-sm font-semibold text-gray-700">運用利回り</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.1"
                      value={simulation.activeReturn}
                      onChange={(e) => setSimulation({...simulation, activeReturn: parseFloat(e.target.value) || 0})}
                      className="w-20 px-2 py-1 border border-emerald-300 rounded text-center font-bold"
                    />
                    <span className="text-sm font-bold text-emerald-700">%</span>
                  </div>
                </div>
                <div className="border-t-2 border-emerald-300 pt-3 mt-3">
                  <div className="text-center mb-4">
                    <div className="text-sm text-gray-600 mb-1">月額積立必要額（運用利回り別）</div>
                  </div>
                  
                  {/* 運用利回り別比較表 */}
                  <div className="space-y-2 mb-4">
                    {[3, 4, 5, 6, 6.5, 7, 8].map(rate => {
                      const monthlyRate = rate / 100 / 12;
                      const monthsToRetirement = (ages.retirement - ages.current) * 12;
                      const monthlyAmount = Math.max(0, calculations.minShortfall) * 10000 * monthlyRate / 
                        (Math.pow(1 + monthlyRate, monthsToRetirement) - 1) / 10000;
                      
                      return (
                        <div key={rate} className={`flex justify-between items-center p-2 rounded-xl ${
                          rate === simulation.activeReturn ? 'bg-emerald-200 border-2 border-emerald-400' : 'bg-white border border-emerald-200'
                        }`}>
                          <span className="text-sm font-semibold text-gray-700">利回り {rate}%</span>
                          <span className={`text-lg font-bold ${
                            rate === simulation.activeReturn ? 'text-emerald-700' : 'text-gray-600'
                          }`}>
                            {monthlyAmount.toFixed(1)} 万円/月
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="text-center p-4 bg-emerald-200 rounded-xl">
                    <div className="text-sm text-gray-700 mb-1">現在の設定（{simulation.activeReturn}%）</div>
                    <div className="text-4xl font-bold text-emerald-700">
                      {calculations.minMonthlyInvestment.toFixed(1)}
                    </div>
                    <div className="text-lg text-gray-600">万円/月</div>
                  </div>
                </div>
                <div className="bg-emerald-100 rounded-2xl p-3">
                  <div className="text-xs text-gray-600 mb-1">{ages.retirement}歳時点での予想資産額</div>
                  <div className="text-2xl font-bold text-emerald-800">
                    {formatAmount(investmentData[investmentData.length - 1]?.最低限_アクティブ || 0)}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 rounded-2xl p-6 border-2 border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-blue-800">ゆとりある生活のための資金</h3>
                <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                  インデックス（NISA）
                </div>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-white rounded-2xl border border-blue-200">
                  <div className="text-xs text-gray-600 mb-1">ゆとり生活費総額</div>
                  <div className="text-lg font-bold text-gray-700">{Math.round(calculations.totalComfortableExpenses).toLocaleString()} 万円</div>
                </div>
                <div className="p-3 bg-white rounded-2xl border border-blue-200">
                  <div className="text-xs text-gray-600 mb-1">最低限必要資金（上記）</div>
                  <div className="text-lg font-bold text-emerald-700">- {Math.round(calculations.minShortfall).toLocaleString()} 万円</div>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-100 rounded-2xl border-2 border-blue-300">
                  <span className="text-sm font-semibold text-gray-700">追加必要資金</span>
                  <span className="text-xl font-bold text-blue-700">{(calculations.comfortableShortfall - calculations.minShortfall).toLocaleString()} 万円</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-2xl">
                  <span className="text-sm font-semibold text-gray-700">投資期間</span>
                  <span className="text-xl font-bold text-blue-700">{ages.retirement - ages.current} 年</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-2xl">
                  <span className="text-sm font-semibold text-gray-700">運用利回り</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.1"
                      value={simulation.indexReturn}
                      onChange={(e) => setSimulation({...simulation, indexReturn: parseFloat(e.target.value) || 0})}
                      className="w-20 px-2 py-1 border border-blue-300 rounded text-center font-bold"
                    />
                    <span className="text-sm font-bold text-blue-700">%</span>
                  </div>
                </div>
                <div className="border-t-2 border-blue-300 pt-3 mt-3">
                  <div className="text-center mb-4">
                    <div className="text-sm text-gray-600 mb-1">月額積立必要額（運用利回り別）</div>
                  </div>
                  
                  {/* 運用利回り別比較表 */}
                  <div className="space-y-2 mb-4">
                    {[2, 3, 4, 5, 6, 7].map(rate => {
                      const monthlyRate = rate / 100 / 12;
                      const monthsToRetirement = (ages.retirement - ages.current) * 12;
                      const comfortDiffShortfall = Math.max(0, calculations.comfortableShortfall - calculations.minShortfall);
                      const monthlyAmount = comfortDiffShortfall * 10000 * monthlyRate / 
                        (Math.pow(1 + monthlyRate, monthsToRetirement) - 1) / 10000;
                      
                      return (
                        <div key={rate} className={`flex justify-between items-center p-2 rounded-xl ${
                          rate === simulation.indexReturn ? 'bg-blue-200 border-2 border-blue-400' : 'bg-white border border-blue-200'
                        }`}>
                          <span className="text-sm font-semibold text-gray-700">利回り {rate}%</span>
                          <span className={`text-lg font-bold ${
                            rate === simulation.indexReturn ? 'text-blue-700' : 'text-gray-600'
                          }`}>
                            {monthlyAmount.toFixed(1)} 万円/月
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="text-center p-4 bg-blue-200 rounded-xl">
                    <div className="text-sm text-gray-700 mb-1">現在の設定（{simulation.indexReturn}%）</div>
                    <div className="text-4xl font-bold text-blue-700">
                      {calculations.comfortDiffMonthlyInvestment.toFixed(1)}
                    </div>
                    <div className="text-lg text-gray-600">万円/月</div>
                  </div>
                </div>
                <div className="bg-blue-100 rounded-2xl p-3">
                  <div className="text-xs text-gray-600 mb-1">{ages.retirement}歳時点での予想資産額</div>
                  <div className="text-2xl font-bold text-blue-800">
                    {formatAmount(investmentData[investmentData.length - 1]?.ゆとり差額_インデックス || 0)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="w-3 h-3 bg-emerald-600 rounded-full"></span>
                最低限の生活費のための運用シミュレーション（アクティブ）
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={investmentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="age" interval={Math.floor(investmentData.length / 8)} />
                  <YAxis label={{ value: '万円', angle: -90, position: 'insideLeft' }} />
                  <Tooltip 
                    formatter={(value) => formatAmount(value)}
                  />
                  <Bar dataKey="最低限_アクティブ" fill="#8b5cf6" name="資産額（万円）" />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-3 text-center text-sm text-gray-600">
                投資期間 {ages.retirement - ages.current}年で形成される資産
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="w-3 h-3 bg-blue-600 rounded-full"></span>
                ゆとりある生活のための運用シミュレーション（インデックス）
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={investmentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="age" interval={Math.floor(investmentData.length / 8)} />
                  <YAxis label={{ value: '万円', angle: -90, position: 'insideLeft' }} />
                  <Tooltip 
                    formatter={(value) => formatAmount(value)}
                  />
                  <Bar dataKey="ゆとり差額_インデックス" fill="#3b82f6" name="資産額（万円）" />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-3 text-center text-sm text-gray-600">
                投資期間 {ages.retirement - ages.current}年で形成される資産
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-gray-200">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-2">老後資金 月額積立必要額（アクティブ + インデックス）</div>
              <div className="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                {(calculations.minMonthlyInvestment + calculations.comfortDiffMonthlyInvestment).toFixed(1)}
              </div>
              <div className="text-xl text-gray-700 font-semibold">万円/月</div>
              <div className="mt-4 p-3 bg-white rounded-2xl">
                <div className="text-sm text-gray-600 mb-1">{ages.retirement}歳時点での合計予想資産額</div>
                <div className="text-3xl font-bold text-emerald-700">
                  {formatAmount((investmentData[investmentData.length - 1]?.最低限_アクティブ || 0) + (investmentData[investmentData.length - 1]?.ゆとり差額_インデックス || 0))}
                </div>
              </div>
            </div>
          </div>

          {/* 教育資金運用シミュレーション */}
          {basicData.hasChildren && educationCosts.children.length > 0 && (
            <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">教育資金運用シミュレーション</h2>
              <div className="text-sm text-gray-600 mb-6">
                大学費用を18歳までに準備するための積立シミュレーション（小中高の費用は毎年の生活費から支出）
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {educationCosts.children.map((childCost) => {
                  // 大学費用のみを抽出
                  const universityStage = childCost.breakdown.find(b => b.stage === '大学');
                  if (!universityStage) return null;
                  
                  const yearsUntil18 = childCost.yearsUntil18;
                  const monthsUntil18 = yearsUntil18 * 12;
                  const universityCost = universityStage.cost;
                  
                  // 積立期間が0以下、または大学費用が0の場合は表示しない
                  if (monthsUntil18 <= 0 || !universityCost || universityCost === 0) {
                    return (
                      <div key={childCost.childIndex} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border-2 border-gray-300">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-bold text-gray-600">第{childCost.childIndex}子 大学資金</h3>
                        </div>
                        <div className="text-center text-gray-500 py-8">
                          {monthsUntil18 <= 0 
                            ? '18歳を超えているため、教育費の積立は不要です' 
                            : '大学進学予定がないため、積立は不要です'}
                        </div>
                      </div>
                    );
                  }
                  
                  // 運用利回り（調整可能）
                  const educationReturn = simulation.educationReturn;
                  const monthlyReturn = educationReturn / 100 / 12;
                  
                  // 月額積立額の計算（複利）
                  const denominator = Math.pow(1 + monthlyReturn, monthsUntil18) - 1;
                  const monthlyInvestmentForUni = denominator > 0 
                    ? universityCost * 10000 * monthlyReturn / denominator
                    : 0;
                  
                  // 18歳時点での予想資産額
                  let projectedAmount = 0;
                  for (let month = 0; month < monthsUntil18; month++) {
                    projectedAmount = projectedAmount * (1 + monthlyReturn) + monthlyInvestmentForUni;
                  }
                  
                  return (
                    <div key={childCost.childIndex} className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border-2 border-emerald-300">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-emerald-800">第{childCost.childIndex}子 大学資金</h3>
                        <div className="bg-emerald-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                          積立投資
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="p-3 bg-white rounded-2xl border border-emerald-200">
                          <div className="text-xs text-gray-600 mb-1">大学費用（目標額・インフレ調整後）</div>
                          <div className="text-2xl font-bold text-gray-800">{Math.round(universityCost || 0).toLocaleString()}</div>
                          <div className="text-sm text-gray-600">万円</div>
                          <div className="text-xs text-emerald-600 mt-1">
                            {universityStage.type}大学（18歳時点で必要）
                          </div>
                          {universityStage.baseCost && universityStage.baseCost !== universityCost && (
                            <div className="text-xs text-gray-500 mt-2">
                              基準額: {universityStage.baseCost}万円<br/>
                              インフレ率{simulation.inflationRate}%×{yearsUntil18}年間を考慮
                            </div>
                          )}
                        </div>
                        
                        <div className="p-3 bg-white rounded-2xl border border-emerald-200">
                          <div className="text-xs text-gray-600 mb-1">積立期間</div>
                          <div className="text-2xl font-bold text-emerald-700">{yearsUntil18}</div>
                          <div className="text-sm text-gray-600">年間（{childCost.childAge > 0 ? `現在${childCost.childAge}歳` : `${Math.abs(childCost.childAge)}年後誕生`} → 18歳）</div>
                        </div>
                        
                        <div className="border-t-2 border-emerald-400 pt-3 mt-3">
                          <div className="text-center">
                            <div className="text-xs text-gray-600 mb-1">月額積立必要額</div>
                            <div className="text-4xl font-bold text-emerald-700">
                              {(monthlyInvestmentForUni / 10000).toFixed(1)}
                            </div>
                            <div className="text-lg text-gray-600">万円/月</div>
                          </div>
                        </div>
                        
                        <div className="bg-emerald-100 rounded-2xl p-3">
                          <div className="text-xs text-gray-600 mb-1">18歳時点での予想資産額</div>
                          <div className="text-2xl font-bold text-emerald-800">
                            {formatAmount(projectedAmount / 10000)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* 運用利回り調整と全体サマリー */}
              <div className="mt-6 p-6 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-xl border-2 border-emerald-400">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">運用利回り</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="20"
                        value={simulation.educationReturn}
                        onChange={(e) => setSimulation({...simulation, educationReturn: parseFloat(e.target.value) || 0})}
                        className="w-24 px-4 py-2 text-2xl font-bold border-2 border-emerald-400 rounded-2xl focus:ring-2 focus:ring-cyan-500 text-center"
                      />
                      <span className="text-2xl font-bold text-emerald-700">%</span>
                      <span className="text-sm text-gray-600">（年率）</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      ※ 一般的な積立投資の想定利回り: 3-5%
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-1">教育資金 合計月額積立額</div>
                    <div className="text-5xl font-bold text-emerald-700">
                      {educationCosts.children.reduce((sum, childCost) => {
                        const universityStage = childCost.breakdown.find(b => b.stage === '大学');
                        if (!universityStage) return sum;
                        const yearsUntil18 = childCost.yearsUntil18;
                        const monthsUntil18 = yearsUntil18 * 12;
                        if (monthsUntil18 <= 0) return sum;
                        const universityCost = universityStage.cost;
                        if (!universityCost || universityCost === 0) return sum;
                        const educationReturn = simulation.educationReturn;
                        const monthlyReturn = educationReturn / 100 / 12;
                        const denominator = Math.pow(1 + monthlyReturn, monthsUntil18) - 1;
                        if (denominator <= 0) return sum;
                        const monthlyInvestmentForUni = universityCost * 10000 * monthlyReturn / denominator;
                        return sum + (monthlyInvestmentForUni / 10000);
                      }, 0).toFixed(1)}
                    </div>
                    <div className="text-xl text-gray-700 font-semibold">万円/月</div>
                    <div className="text-xs text-gray-600 mt-2">
                      （大学資金のみ・利回り{simulation.educationReturn}%で運用）
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 教育費を含む総合計 */}
          {basicData.hasChildren && educationCosts.total > 0 && (
            <div className="mt-6 p-6 bg-gradient-to-r from-emerald-100 via-purple-100 to-teal-100 rounded-2xl border-2 border-indigo-300">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-800 mb-3">総合必要積立額（老後資金 + 教育費）</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="p-3 bg-white rounded-2xl">
                    <div className="text-xs text-gray-600">老後資金</div>
                    <div className="text-2xl font-bold text-emerald-700">
                      {(calculations.minMonthlyInvestment + calculations.comfortDiffMonthlyInvestment).toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-600">万円/月</div>
                  </div>
                  <div className="p-3 bg-white rounded-2xl">
                    <div className="text-xs text-gray-600">教育費（全子供）</div>
                    <div className="text-2xl font-bold text-emerald-700">
                      {educationCosts.children.reduce((sum, c) => {
                        const u = c.breakdown.find(b => b.stage === '大学');
                        if (!u || c.yearsUntil18 <= 0 || !u.cost || u.cost === 0) return sum;
                        const m = c.yearsUntil18 * 12;
                        const r = simulation.educationReturn / 100 / 12;
                        const d = Math.pow(1 + r, m) - 1;
                        if (d <= 0) return sum;
                        return sum + (u.cost * 10000 * r / d / 10000);
                      }, 0).toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-600">万円/月</div>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-2xl border-2 border-indigo-400">
                    <div className="text-xs text-gray-600 font-bold">合計</div>
                    <div className="text-3xl font-bold text-emerald-700">
                      {(calculations.minMonthlyInvestment + calculations.comfortDiffMonthlyInvestment + 
                        educationCosts.children.reduce((sum, c) => {
                          const u = c.breakdown.find(b => b.stage === '大学');
                          if (!u || c.yearsUntil18 <= 0 || !u.cost || u.cost === 0) return sum;
                          const m = c.yearsUntil18 * 12;
                          const r = simulation.educationReturn / 100 / 12;
                          const d = Math.pow(1 + r, m) - 1;
                          if (d <= 0) return sum;
                          return sum + (u.cost * 10000 * r / d / 10000);
                        }, 0)).toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-600">万円/月</div>
                  </div>
                </div>
                
                {/* 子供別の積立内訳 */}
                {educationCosts.children.length > 0 && (
                  <div className="mt-4 p-4 bg-white rounded-2xl">
                    <div className="text-sm font-bold text-gray-700 mb-2">教育費の内訳</div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {educationCosts.children.map((childCost) => {
                        const u = childCost.breakdown.find(b => b.stage === '大学');
                        if (!u || childCost.yearsUntil18 <= 0) return null;
                        const m = childCost.yearsUntil18 * 12;
                        const r = simulation.educationReturn / 100 / 12;
                        const d = Math.pow(1 + r, m) - 1;
                        const monthly = d > 0 ? (u.cost * 10000 * r / d / 10000) : 0;
                        
                        return (
                          <div key={childCost.childIndex} className="p-2 bg-emerald-50 rounded border border-emerald-300">
                            <div className="text-xs text-gray-600">第{childCost.childIndex}子</div>
                            <div className="text-lg font-bold text-emerald-700">{monthly.toFixed(1)}</div>
                            <div className="text-xs text-gray-600">万円/月</div>
                            <div className="text-xs text-gray-500">({childCost.yearsUntil18}年間)</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                <div className="mt-4 text-sm text-gray-600">
                  老後資金は{ages.current}歳から{ages.retirement}歳まで、教育費は各子供が18歳になるまで積み立てることで、
                  老後資金と全ての子供の教育費を準備できます
                </div>
              </div>
            </div>
          )}
          
          {/* 最終サマリー */}
          <div className="mt-8 p-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl shadow-2xl text-white">
            <h2 className="text-3xl font-bold text-center mb-8">💰 必要な積立額まとめ</h2>
            
            {/* 教育資金の計算 */}
            {(() => {
              const educationMonthly = basicData.hasChildren ? educationCosts.children.reduce((sum, c) => {
                const u = c.breakdown.find(b => b.stage === '大学');
                if (!u || c.yearsUntil18 <= 0 || !u.cost || u.cost === 0) return sum;
                const m = c.yearsUntil18 * 12;
                const r = simulation.educationReturn / 100 / 12;
                const d = Math.pow(1 + r, m) - 1;
                if (d <= 0) return sum;
                return sum + (u.cost * 10000 * r / d / 10000);
              }, 0) : 0;
              
              return (
                <div className="space-y-6">
                  {/* パターン1: 最低限の生活費 + 教育資金 */}
                  <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 border-2 border-white/30">
                    <div className="text-2xl font-bold mb-4">📊 パターン①: 最低限の生活費 + 教育資金</div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-sm opacity-75">老後資金（最低限）</div>
                        <div className="text-3xl font-bold">{calculations.minMonthlyInvestment.toFixed(1)}</div>
                        <div className="text-sm">万円/月</div>
                      </div>
                      {basicData.hasChildren && educationCosts.total > 0 && (
                        <div className="text-center">
                          <div className="text-sm opacity-75">教育資金</div>
                          <div className="text-3xl font-bold">{educationMonthly.toFixed(1)}</div>
                          <div className="text-sm">万円/月</div>
                        </div>
                      )}
                      <div className="text-center bg-white/20 rounded-xl p-3">
                        <div className="text-sm opacity-75 font-bold">合計</div>
                        <div className="text-4xl font-bold text-yellow-300">
                          {(calculations.minMonthlyInvestment + educationMonthly).toFixed(1)}
                        </div>
                        <div className="text-lg">万円/月</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* パターン2: ゆとりのある生活費 + 教育資金 */}
                  <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 border-2 border-white/30">
                    <div className="text-2xl font-bold mb-4">📊 パターン②: ゆとりのある生活費 + 教育資金</div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-sm opacity-75">老後資金（ゆとり）</div>
                        <div className="text-3xl font-bold">
                          {(calculations.minMonthlyInvestment + calculations.comfortDiffMonthlyInvestment).toFixed(1)}
                        </div>
                        <div className="text-sm">万円/月</div>
                      </div>
                      {basicData.hasChildren && educationCosts.total > 0 && (
                        <div className="text-center">
                          <div className="text-sm opacity-75">教育資金</div>
                          <div className="text-3xl font-bold">{educationMonthly.toFixed(1)}</div>
                          <div className="text-sm">万円/月</div>
                        </div>
                      )}
                      <div className="text-center bg-white/20 rounded-xl p-3">
                        <div className="text-sm opacity-75 font-bold">合計</div>
                        <div className="text-4xl font-bold text-yellow-300">
                          {(calculations.minMonthlyInvestment + calculations.comfortDiffMonthlyInvestment + educationMonthly).toFixed(1)}
                        </div>
                        <div className="text-lg">万円/月</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center text-sm opacity-90 mt-4">
                    老後資金は{ages.current}歳から{ages.retirement}歳まで、教育費は各子供が18歳になるまで積み立て
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* フッター */}
        <div className="mt-12 pt-8 border-t-2 border-emerald-200">
          <div className="text-center">
            <div className="mb-6 inline-block">
              <div className="flex items-center gap-4 justify-center mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-2xl">U</span>
                </div>
                <div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">
                    Unicara Life Planning
                  </div>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-2">※ このツールは参考情報を提供するものであり、投資判断は自己責任で行ってください</p>
            <p className="text-sm text-gray-400">© 2026 Unicara株式会社</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(LifePlanningApp));