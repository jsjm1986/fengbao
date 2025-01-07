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
        const extractPrompt = `作为一位经验丰富的中医专家，请仔细分析以下症状描述：\n${prompt}\n
请按照以下步骤进行分析：

1. 症状提取和归类：
   - 列出所有描述的症状
   - 将症状按照主次症状分类
   - 标注每个症状的特点（如：持续性、间歇性、加重因素等）

2. 中医理论分析：
   - 分析这些症状涉及的脏腑经络
   - 分析症状的病因病机
   - 辨别寒热虚实
   - 分析气血津液状态

3. 症状关联性分析：
   - 分析症状之间的相互关系
   - 找出症状的发展规律
   - 判断是否存在某种证候

4. 预测可能出现的其他症状：
   基于以上分析，请预测：
   a) 必然会出现的症状（90%以上概率）
   b) 极可能出现的症状（70-90%概率）
   c) 可能出现的症状（50-70%概率）
   d) 需要警惕的严重症状（虽然概率较低，但出现则危险）

对于每个预测的症状，请说明：
1. 具体表现形式
2. 出现的原因（从中医理论角度解释）
3. 与现有症状的关联
4. 预防或缓解的建议
5. 出现该症状时的处理建议

请用专业但易懂的语言描述，避免使用过于晦涩的中医术语。`;

        // 这里是模拟的症状提取和分析结果
        // 实际项目中应该调用真实的API进行分析
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

        result += '\n【中医理论分析】\n';
        
        // 根据不同症状组合进行分析
        if (symptomList.some(s => s.includes('手脚冰凉'))) {
            result += '您的症状表现为阳气不足，气血运行不畅。手脚为人体末梢，需要阳气温煦和气血濡养。\n';
        }
        if (symptomList.some(s => s.includes('不想吃饭'))) {
            result += '食欲减退提示脾胃功能失调，运化功能减弱。\n';
        }

        result += '\n【可能出现的其他症状】\n';
        result += '根据中医理论分析，您可能会出现以下症状：\n\n';

        // 必然会出现的症状（90%以上）
        result += '1. 必然会出现（90%以上）：\n';
        if (symptomList.some(s => s.includes('手脚冰凉'))) {
            result += '   ▶ 疲劳乏力\n';
            result += '   - 具体表现：全身无力，容易疲倦，精神不振\n';
            result += '   - 出现原因：阳气不足导致气血运行迟缓\n';
            result += '   - 与现有症状关系：是手脚冰凉症状的进一步发展\n';
            result += '   - 预防建议：\n';
            result += '     1) 适当运动，促进血液循环\n';
            result += '     2) 保持手脚温暖，可以泡脚\n';
            result += '     3) 规律作息，保证充足睡眠\n\n';
        }

        // 极可能出现的症状（70-90%）
        result += '2. 极可能出现（70-90%）：\n';
        if (symptomList.some(s => s.includes('不想吃饭'))) {
            result += '   ▶ 消化功能减退\n';
            result += '   - 具体表现：胃部胀满，消化不良，打嗝\n';
            result += '   - 出现原因：脾胃功能减弱，运化失常\n';
            result += '   - 与现有症状关系：是食欲减退的并发症状\n';
            result += '   - 预防建议：\n';
            result += '     1) 规律饮食，少食多餐\n';
            result += '     2) 选择易消化的温热食物\n';
            result += '     3) 饭后适当活动\n\n';
        }

        // 可能出现的症状（50-70%）
        result += '3. 可能出现（50-70%）：\n';
        result += '   ▶ 睡眠质量下降\n';
        result += '   - 具体表现：入睡困难，易醒，睡眠不实\n';
        result += '   - 出现原因：阳气不足影响心神，脾胃功能减弱影响气血生化\n';
        result += '   - 与现有症状关系：是多个症状综合影响的结果\n';
        result += '   - 预防建议：\n';
        result += '     1) 保持规律作息\n';
        result += '     2) 睡前泡脚，促进血液循环\n';
        result += '     3) 避免睡前剧烈运动或进食\n\n';

        // 需要警惕的症状
        result += '⚠️ 需要警惕（严重症状）：\n';
        result += '   ▶ 危险信号\n';
        result += '   - 具体表现：\n';
        result += '     1) 持续性头晕、心悸气短\n';
        result += '     2) 严重腹痛或持续性腹部不适\n';
        result += '     3) 极度疲劳或虚弱\n';
        result += '   - 警示意义：提示气血亏虚严重或脏腑功能严重失调\n';
        result += '   - 处理建议：出现以上任何症状请立即就医\n\n';

        result += '【温馨提示】\n';
        result += '1. 以上预测基于中医理论和临床经验，仅供参考\n';
        result += '2. 建议您：\n';
        result += '   - 每天记录症状变化\n';
        result += '   - 注意观察新症状的出现\n';
        result += '   - 保持良好的作息和饮食习惯\n';
        result += '3. 如果出现预测的症状：\n';
        result += '   - 轻微症状：可以观察，但要记录\n';
        result += '   - 中度症状：建议及时就医\n';
        result += '   - 严重症状：需要立即就医\n';
        result += '4. 在家可以采取的调理方法：\n';
        result += '   - 保持作息规律\n';
        result += '   - 适量运动，注意保暖\n';
        result += '   - 调整饮食结构\n';
        result += '   - 保持心情舒畅';

        return result;
    }
}

// 创建全局实例
window.apiService = new ApiService(); 