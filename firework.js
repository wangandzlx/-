// ================= 初始化画布 =================
const canvas = document.getElementById('fireworkCanvas');
const ctx = canvas.getContext('2d');

// 动态调整画布尺寸（适配手机浏览器工具栏）
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
        canvas.height = window.visualViewport?.height || window.innerHeight;
    }
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// ================= 粒子系统 =================
class Particle {
    constructor(x, y, hue, velocity) {
        this.x = x;
        this.y = y;
        this.hue = hue;         // 色相值
        this.velocity = velocity; // 速度向量
        this.alpha = 1;         // 透明度
        this.size = Math.random() * 3 + 1; // 随机大小
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${this.hue}, 100%, 50%)`;
        ctx.fill();
        ctx.restore();
    }

    update() {
        this.velocity.x *= 0.98;  // 空气阻力
        this.velocity.y += 0.05;  // 重力
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.alpha -= 0.007;      // 渐隐速度
    }
}

let particles = [];

// ================= 烟花生成逻辑 =================
function createFirework(x, y, style) {
    const hue = Math.random() * 360; // 随机颜色
    const particleCount = style === 'spiral' ? 400 : 300;

    for (let i = 0; i < particleCount; i++) {
        let velocity;
        switch (style) {
            case 'heart': {
                // 爱心轨迹公式
                const angle = (Math.PI * 2 * i) / particleCount;
                const t = angle * 4;
                velocity = {
                    x: 16 * Math.pow(Math.sin(t), 3),
                    y: -13 * Math.cos(t) + 5*Math.cos(2*t) + 2*Math.cos(3*t) + Math.cos(4*t)
                };
                break;
            }
            case 'spiral': {
                // 螺旋轨迹
                const radius = 0.5 + i / 50;
                velocity = {
                    x: Math.cos(i) * radius,
                    y: Math.sin(i) * radius
                };
                break;
            }
            default: {
                // 经典圆形爆炸
                const speed = 2 + Math.random() * 4;
                const angle = (Math.PI * 2 * i) / particleCount;
                velocity = {
                    x: Math.cos(angle) * speed,
                    y: Math.sin(angle) * speed
                };
            }
        }
        particles.push(new Particle(x, y, hue, velocity));
    }
}

// ================= 动画循环 =================
function animate() {
    // 半透明背景实现拖尾效果
    ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 更新并绘制所有粒子
    particles.forEach((particle, index) => {
        if (particle.alpha <= 0) {
            particles.splice(index, 1);
        } else {
            particle.update();
            particle.draw();
        }
    });

    requestAnimationFrame(animate);
}

// ================= 交互控制 =================
function launchFirework() {
    const style = document.getElementById('styleSelect').value;
    const x = Math.random() * canvas.width * 0.8 + canvas.width * 0.1; // 避免边缘发射
    const y = canvas.height - 50;
    createFirework(x, y, style);
}

// 手机触控支持
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const y = e.touches[0].clientY - rect.top;
    const style = document.getElementById('styleSelect').value;
    createFirework(x, y, style);
}, { passive: false });

// 启动动画
animate();