class SymptomPredictor {
    constructor() {
        this.userInfo = null;
        this.symptoms = [];
    }

    // 设置用户信息
    setUserInfo(userInfo) {
        this.userInfo = userInfo;
    }

    // 添加症状记录
    addSymptom(symptom) {
        this.symptoms.push({
            content: symptom,
            timestamp: new Date()
        });
    }

    // 清空症状记录
    clearSymptoms() {
        this.symptoms = [];
    }

    // 生成预测提示词
    _generatePrompt() {
        let prompt = `作为一个经验丰富的中医师，请根据患者的症状描述，预测可能伴随出现的其他症状。\n\n`;
        
        // 添加用户基本信息
        prompt += `【患者基本信息】\n`;
        prompt += `- 性别：${this.userInfo.gender}\n`;
        prompt += `- 年龄：${this.userInfo.age}岁\n`;
        if (this.userInfo.height && this.userInfo.weight) {
            const bmi = (this.userInfo.weight / ((this.userInfo.height/100) * (this.userInfo.height/100))).toFixed(1);
            prompt += `- 身高：${this.userInfo.height}cm\n`;
            prompt += `- 体重：${this.userInfo.weight}kg\n`;
            prompt += `- BMI：${bmi}\n`;
        }
        if (this.userInfo.birthDate) {
            prompt += `- 出生日期：${this.userInfo.birthDate}（${this.userInfo.calendarType === 'lunar' ? '农历' : '阳历'}）\n`;
        }

        // 添加症状描述
        prompt += `\n【已知症状】\n`;
        this.symptoms.forEach((symptom, index) => {
            prompt += `${index + 1}. ${symptom.content}\n`;
        });

        // 添加分析要求
        prompt += `\n请根据中医理论和临床经验，进行以下分析：

【分析要求】
1. 症状关联分析：
   - 分析已知症状之间的关联性
   - 说明症状之间的相互影响

2. 可能伴随症状预测：
   - 预测最可能同时出现的其他症状（按照出现概率排序）
   - 对每个预测症状进行详细说明
   - 解释为什么会出现这些症状

3. 症状发展趋势：
   - 预测症状可能的发展变化
   - 说明在什么情况下可能加重或减轻

4. 需要重点关注的症状：
   - 指出哪些症状需要特别注意
   - 说明这些症状的危险信号

请注意：
1. 预测要基于中医理论中的脏腑关联、经络循行等理论
2. 考虑患者的年龄、性别等基本情况
3. 预测要准确、具体，并说明理由
4. 如果预测到严重症状，请特别标注出来

请用专业但易懂的语言描述，让患者能够理解并提高警惕性。`;

        return prompt;
    }

    // 获取症状预测
    async getPrediction() {
        if (!this.userInfo || this.symptoms.length === 0) {
            throw new Error('缺少必要的用户信息或症状描述');
        }

        const prompt = this._generatePrompt();
        
        try {
            // 使用 API 服务获取预测结果
            const response = await apiService.getCompletion(prompt);
            return response;
        } catch (error) {
            console.error('症状预测出错：', error);
            throw new Error('症状预测失败，请稍后重试');
        }
    }
}

// 创建全局实例
const symptomPredictor = new SymptomPredictor(); 