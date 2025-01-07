class ApiService {
    constructor() {
        // API配置
        this.API_KEY = 'sk-7eeeb89fd2b64611b73cea2c9f7d55de';
        this.API_URL = 'https://api.deepseek.com/v1/chat/completions';
        this.config = API_CONFIG;
    }

    // 调用Deepseek API
    async callDeepseekAPI(messages, onChunk) {
        try {
            // 准备请求参数
            const requestBody = {
                model: this.config.model,
                messages: messages,
                temperature: this.config.temperature,
                max_tokens: this.config.max_tokens,
                top_p: this.config.top_p,
                frequency_penalty: this.config.frequency_penalty,
                presence_penalty: this.config.presence_penalty,
                stream: true
            };

            // 发送请求
            const response = await fetch(this.API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.API_KEY}`
                },
                body: JSON.stringify(requestBody)
            });

            // 检查响应状态
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || `API请求失败: ${response.status} ${response.statusText}`);
            }

            // 处理流式响应
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let content = '';

            while (true) {
                const {done, value} = await reader.read();
                if (done) break;
                
                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');
                
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const jsonStr = line.slice(6);
                        if (jsonStr === '[DONE]') continue;
                        
                        try {
                            const jsonData = JSON.parse(jsonStr);
                            const delta = jsonData.choices[0]?.delta?.content || '';
                            content += delta;
                            
                            // 触发进度更新回调
                            if (onChunk) {
                                onChunk(delta);
                            }
                        } catch (e) {
                            console.warn('解析响应数据出错:', e);
                        }
                    }
                }
            }

            return content;

        } catch (error) {
            console.error('API调用错误:', error);
            throw error;
        }
    }

    // 获取AI回复
    async getAIResponse(messages) {
        // 实现获取AI回复的逻辑
    }

    // 获取五运六气分析
    async getWuYunLiuQiAnalysis(year, month, day, calendarType) {
        // 实现五运六气分析的逻辑
    }

    // 获取症状预测结果
    async getCompletion(prompt) {
        // 首先提取和分析症状
        const extractPrompt = `请提取并分析以下描述中的症状信息：\n${prompt}\n请按照以下格式输出：
1. 提取出的具体症状（每个症状单独一行）
2. 这些症状的初步分析（包括可能的关联性）
3. 这些症状对应的中医理论分析`;

        // 这里是模拟的症状提取和分析结果
        // 实际项目中应该调用真实的API进行两次调用
        return new Promise((resolve) => {
            setTimeout(() => {
                // 先进行症状提取和分析
                const symptoms = prompt.split('【已知症状】')[1]?.split('请根据中医理论')[0]?.trim() || '';
                const symptomList = symptoms.split('\n').map(s => s.trim()).filter(s => s);
                
                // 生成预测结果
                const response = this._generateMockPrediction(symptomList);
                resolve(response);
            }, 1000);
        });
    }

    // 生成模拟的预测结果（仅用于演示）
    _generateMockPrediction(symptomList) {
        if (!symptomList || symptomList.length === 0) {
            return '未能提取到具体症状信息，请描述您的症状。';
        }

        // 构建症状分析结果
        let result = '【症状分析】\n';
        result += '我理解到您目前主要的不适是：\n';
        symptomList.forEach((symptom, index) => {
            result += `${index + 1}. ${symptom}\n`;
        });

        // 根据不同的症状组合，生成不同的预测内容
        result += '\n【可能出现的其他症状】\n';
        result += '根据您的症状特点，可能会出现以下新的不适：\n\n';

        // 根据症状特点生成相应的预测
        if (symptomList.some(s => s.includes('手脚冰凉'))) {
            result += '1. 很可能出现（80%以上）：\n';
            result += '   ▶ 疲劳乏力\n';
            result += '   - 具体表现：容易疲倦，精神不振\n';
            result += '   - 出现原因：与手脚冰凉症状相关，提示气血运行不足\n';
            result += '   - 缓解建议：注意保暖，适当运动促进血液循环\n\n';
        }

        if (symptomList.some(s => s.includes('不想吃饭'))) {
            result += '2. 可能出现（60-80%）：\n';
            result += '   ▶ 消化功能减退\n';
            result += '   - 具体表现：胃部不适，消化不良\n';
            result += '   - 出现原因：与食欲不振有关，说明脾胃功能受到影响\n';
            result += '   - 缓解建议：少食多餐，选择容易消化的食物\n\n';
        }

        result += '3. 需要预防（40-60%）：\n';
        result += '   ▶ 睡眠质量下降\n';
        result += '   - 具体表现：容易失眠，睡眠不安\n';
        result += '   - 出现原因：是当前症状影响下的自然反应\n';
        result += '   - 缓解建议：保持规律作息，睡前泡脚助眠\n\n';

        result += '⚠️ 需要警惕（如果出现需及时就医）：\n';
        result += '   ▶ 严重症状\n';
        result += '   - 具体表现：持续性头晕、心悸气短\n';
        result += '   - 警示意义：可能提示气血亏虚加重\n';
        result += '   - 建议：出现这些症状请立即就医\n\n';

        result += '【温馨提示】\n';
        result += '1. 以上预测是根据您的具体症状分析得出\n';
        result += '2. 如果出现预测的症状，建议：\n';
        result += '   - 轻微症状：可以先观察，保持记录\n';
        result += '   - 中度症状：建议及时就医咨询\n';
        result += '   - 严重症状：需要立即就医\n';
        result += '3. 建议您可以每天记录症状的变化，这对诊疗很有帮助';

        return result;
    }
}

// 创建全局实例
window.apiService = new ApiService(); 