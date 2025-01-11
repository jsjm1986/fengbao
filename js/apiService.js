class ApiService {
    constructor() {
        // API配置
        this.API_KEY = 'sk-b86f41844f9246d289fda1c940878d8d';
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
        // 构建纯提示词框架
        const analysisPrompt = `作为一位经验丰富的中医专家，请根据以下中医理论对患者症状进行分析，并预测可能出现的其他症状：

分析思路：
1. 八纲辨证：分析症状的阴阳、表里、寒热、虚实特点
2. 脏腑辨证：判断受累脏腑，分析其功能状态
3. 气血津液辨证：评估气血运行、津液代谢状况
4. 经络辨证：分析症状所涉及的经络循行
5. 病因病机：分析致病因素和发病机理

基于以上分析，请按照下面的格式输出预测的症状：

【必然会出现的症状】（90%以上概率）
- 症状名称：
- 具体表现：
- 出现原因：（请从中医理论角度解释）
- 与已有症状的关系：

【极可能出现的症状】（70-90%概率）
- 症状名称：
- 具体表现：
- 出现原因：（请从中医理论角度解释）
- 与已有症状的关系：

【可能出现的症状】（50-70%概率）
- 症状名称：
- 具体表现：
- 出现原因：（请从中医理论角度解释）
- 与已有症状的关系：

【需要警惕的症状】（需要立即就医）
- 症状名称：
- 危险表现：
- 出现原因：（请从中医理论角度解释）
- 紧急处理建议：

注意：
1. 预测要基于中医整体观和辨证论治的思维
2. 要考虑脏腑之间的关联性
3. 要注意气血津液的相互影响
4. 要结合经络循行规律
5. 要体现阴阳平衡理念

请用通俗易懂的语言描述，确保患者能够理解。

患者症状：${prompt}`;

        // 调用API获取预测结果
        try {
            const messages = [{
                role: 'user',
                content: analysisPrompt
            }];
            return await this.callDeepseekAPI(messages, null);
        } catch (error) {
            console.error('获取症状预测失败：', error);
            throw error;
        }
    }
}

// 创建全局实例
window.apiService = new ApiService(); 
