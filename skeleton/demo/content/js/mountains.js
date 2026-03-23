class MountainsDrawer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.handleResize = this.draw.bind(this);
    this.points = [];
    this.basePoints = [];
    this.w = 0;
    this.h = 0;
    this.startTime = null; // Track animation start time
    this.init();
    this.attachResizeHandler();
    this.animate = this.animate.bind(this);
    this.animate();
  }


  init() {
    const dpr = (window.devicePixelRatio || 1) * 2;

    // Get the parent container size
    const parent = this.canvas.parentElement;
    const rect = parent.getBoundingClientRect();
    const cssWidth = rect.width;
    const cssHeight = rect.height;

    // Set the canvas pixel size for high-DPI
    this.canvas.width = Math.round(cssWidth * dpr);
    this.canvas.height = Math.round(cssHeight * dpr);

    // Reset transform and scale for DPR
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);

    // Now draw using CSS pixel coordinates
    this.w = cssWidth;
    this.h = cssHeight;

    // Generate N random points
    const numMtPoints = 8;
    this.points = [];
    this.basePoints = [];
    for (let i = 0; i < numMtPoints; i++) {
      const x = i * (this.w / (numMtPoints - 1));
      const y = this.h * (0.4 + 0.4 * Math.random());
      this.points[i] = [x, y];
      this.basePoints[i] = [x, y];
    }
  }

  animate(now) {
    if (!this.startTime) this.startTime = now;
    const elapsed = (now - this.startTime) / 1000; // seconds

    // Animate Y positions with sinewave
    for (let i = 0; i < this.points.length; i++) {
      const [x, baseY] = this.basePoints[i];
      const amplitude = 18 + 10 * Math.sin(i * 0.5);
      const frequency = 1.2 + 0.1 * i;
      const phase = i * 0.3;
      const y = baseY + Math.sin(elapsed * frequency + phase) * amplitude;
      this.points[i][1] = y;
    }
    this.draw();
    requestAnimationFrame(this.animate);
  }

  draw() {
    this.ctx.clearRect(0, 0, this.w, this.h);
    this.ctx.save();
    this.ctx.translate(-2, 2);
    this.ctx.beginPath();
    // Start at bottom left
    this.ctx.moveTo(0, this.h);
    // Up to first point
    this.ctx.lineTo(this.points[0][0], this.points[0][1]);
    // Smooth through all points using quadratic curves
    for (let i = 1; i < this.points.length - 1; i++) {
      const xc = (this.points[i][0] + this.points[i + 1][0]) / 2;
      const yc = (this.points[i][1] + this.points[i + 1][1]) / 2;
      this.ctx.quadraticCurveTo(
        this.points[i][0], this.points[i][1],
        xc, yc
      );
    }
    // Last segment to the last point
    this.ctx.lineTo(this.points[this.points.length - 1][0] + 10, this.points[this.points.length - 1][1]);
    // Down to bottom right
    this.ctx.lineTo(this.w + 10, this.h);
    // Close path to bottom left
    this.ctx.closePath();

    const grad = this.ctx.createLinearGradient(0, this.h * 0.4, 0, this.h);
    grad.addColorStop(0, "rgba(255,255,255,0.15)");
    grad.addColorStop(1, "rgba(0,0,0,0.35)");
    this.ctx.fillStyle = grad;
    this.ctx.fill();

    this.ctx.strokeStyle = "rgba(255,255,255,0.3)";
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
    this.ctx.restore();
  }

  attachResizeHandler() {
    window.addEventListener('resize', this.handleResize);
  }

  detachResizeHandler() {
    window.removeEventListener('resize', this.handleResize);
  }
}
