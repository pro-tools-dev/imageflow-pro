const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class LicenseManager {
  constructor() {
    this.licenseFile = path.join(require('os').homedir(), '.imageflow-pro', 'license.json');
    this.statsFile = path.join(require('os').homedir(), '.imageflow-pro', 'stats.json');
    this.init();
  }

  async init() {
    try {
      await fs.mkdir(path.dirname(this.licenseFile), { recursive: true });
      
      // 初始化統計文件
      if (!await this.fileExists(this.statsFile)) {
        await this.saveStats({
          totalProcessed: 0,
          firstUseDate: new Date().toISOString(),
          lastUseDate: new Date().toISOString(),
          sessions: 1
        });
      }
    } catch (error) {
      console.error('License manager init error:', error);
    }
  }

  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async getLicense() {
    try {
      if (await this.fileExists(this.licenseFile)) {
        const data = await fs.readFile(this.licenseFile, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error reading license:', error);
    }
    
    return null;
  }

  async validateLicense(key) {
    // 簡單的驗證邏輯 - 實際產品中應該使用更安全的驗證
    const validKeys = [
      'DONATE-2024-IMAGE-FLOW',
      'SUPPORTER-IMAGE-PRO',
      'THANK-YOU-FOR-DONATE'
    ];
    
    return validKeys.includes(key.toUpperCase());
  }

  async activateLicense(key) {
    const isValid = await this.validateLicense(key);
    
    if (isValid) {
      const licenseData = {
        key: key,
        activated: new Date().toISOString(),
        type: 'donation',
        valid: true
      };
      
      await fs.writeFile(this.licenseFile, JSON.stringify(licenseData, null, 2));
      return { success: true, message: 'License activated successfully!' };
    }
    
    return { success: false, message: 'Invalid license key' };
  }

  async getStats() {
    try {
      if (await this.fileExists(this.statsFile)) {
        const data = await fs.readFile(this.statsFile, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error reading stats:', error);
    }
    
    return {
      totalProcessed: 0,
      firstUseDate: new Date().toISOString(),
      lastUseDate: new Date().toISOString(),
      sessions: 1
    };
  }

  async updateStats(processedCount = 0) {
    const stats = await this.getStats();
    
    stats.totalProcessed += processedCount;
    stats.lastUseDate = new Date().toISOString();
    stats.sessions = (stats.sessions || 0) + 1;
    
    await this.saveStats(stats);
    return stats;
  }

  async saveStats(stats) {
    await fs.writeFile(this.statsFile, JSON.stringify(stats, null, 2));
  }

  async checkLimits() {
    const license = await this.getLicense();
    const stats = await this.getStats();
    
    // 如果有有效許可證，無限制
    if (license && license.valid) {
      return { limited: false, reason: null };
    }
    
    // 免費版限制
    const freeLimits = {
      maxFilesPerDay: 20,
      maxTotalFiles: 100
    };
    
    // 檢查每日限制
    const today = new Date().toISOString().split('T')[0];
    const lastUseDate = stats.lastUseDate ? stats.lastUseDate.split('T')[0] : today;
    
    // 如果是新的一天，重置計數（簡化邏輯）
    if (lastUseDate !== today) {
      // 實際產品中應該有更複雜的每日追蹤
    }
    
    // 檢查總文件限制
    if (stats.totalProcessed >= freeLimits.maxTotalFiles) {
      return { 
        limited: true, 
        reason: `Free version limit reached (${freeLimits.maxTotalFiles} files). Please consider donating to unlock unlimited processing.`,
        remaining: 0
      };
    }
    
    const remaining = freeLimits.maxTotalFiles - stats.totalProcessed;
    return { 
      limited: false, 
      reason: null,
      remaining,
      totalProcessed: stats.totalProcessed
    };
  }

  async incrementProcessed(count = 1) {
    const stats = await this.updateStats(count);
    return stats;
  }

  async showDonationReminder() {
    const stats = await this.getStats();
    const limits = await this.checkLimits();
    
    if (limits.limited) {
      return {
        show: true,
        type: 'blocked',
        message: limits.reason,
        stats: stats
      };
    }
    
    // 在處理一定數量文件後顯示提醒
    const reminderThresholds = [10, 25, 50, 75];
    
    for (const threshold of reminderThresholds) {
      if (stats.totalProcessed === threshold) {
        return {
          show: true,
          type: 'reminder',
          message: `You've processed ${threshold} images! Consider donating to support development and unlock unlimited processing.`,
          stats: stats
        };
      }
    }
    
    return { show: false };
  }
}

module.exports = LicenseManager;