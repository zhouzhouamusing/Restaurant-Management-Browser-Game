import { Customer } from "./customer.js";
import { Restaurant } from "./restaurant.js";
import { drawCustomerBody, drawStaffBody } from "./character-renderer.js";
import {
  drawCreamWall, drawBrickWall, drawStripeWall, drawFloralWall,
  drawWoodFloor, drawCheckerFloor, drawTerracottaFloor, drawMarbleFloor,
  drawMonstera, drawFicus, drawSucculent, drawBamboo, drawHangingPlant,
  drawLandscapePainting, drawFoodPainting, drawAbstractPainting,
  drawWallClock, drawWallShelf, drawDecorMirror,
  drawPendantLamp, drawChandelier, drawWallSconce, drawFloorLamp,
  drawCabinet, drawBookshelf, drawSofa, drawWineRack,
  drawAirConditioner, drawWaterDispenser, drawSpeaker, drawTV,
  drawVelvetCurtain, drawSheerCurtain, drawBambooBlinds,
  draw3DTable, drawWindowLightShaft, drawVignette, drawBaseboard,
  drawCeilingMolding, drawAmbientLighting
} from "./decoration-renderer.js";
import { findItemById } from "./decorations.js";

const FONT = '"ZCOOL KuaiLe", "Nunito", "Comic Sans MS", cursive';

const DECORATION_DRAW_FNS = {
  drawMonstera, drawFicus, drawSucculent, drawBamboo, drawHangingPlant,
  drawLandscapePainting, drawFoodPainting, drawAbstractPainting,
  drawWallClock, drawWallShelf, drawDecorMirror,
  drawPendantLamp, drawChandelier, drawWallSconce, drawFloorLamp,
  drawCabinet, drawBookshelf, drawSofa, drawWineRack,
  drawAirConditioner, drawWaterDispenser, drawSpeaker, drawTV,
  drawVelvetCurtain, drawSheerCurtain, drawBambooBlinds
};

export class GameEngine {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.restaurant = new Restaurant(canvas.width, canvas.height);
    this.customers = [];
    this.particles = [];
    this.floatingTexts = [];
    this.customerIdCounter = 0;
    this.spawnTimer = 0;
    this.spawnInterval = 200;
    this.running = false;
    this.hoveredCustomer = null;
    this.frameCount = 0;

    this.onCustomerClick = options.onCustomerClick || (() => {});
    this.onEarnCoins = options.onEarnCoins || (() => {});
    this.onServeCustomer = options.onServeCustomer || (() => {});
    this.onStaffAction = options.onStaffAction || (() => {});
    this.onSalaryPaid = options.onSalaryPaid || (() => {});
    this.onPositionChanged = options.onPositionChanged || (() => {});

    this.dishes = options.dishes || [];
    this.staff = [];
    this.billHistory = [];

    // Decoration state
    this.decorationState = {
      activeWallpaper: 'wp_cream',
      activeFloor: 'fl_wood',
      placed: []
    };

    // Bonuses from decorations
    this.tipBonus = 0;
    this.patienceBonus = 0;

    // Edit mode (drag-and-drop furniture)
    this.editMode = false;
    this.dragTarget = null;
    this.dragOffset = { x: 0, y: 0 };
    this.hoveredDragItem = null;

    // Offscreen canvas cache for floor/wall
    this._bgCache = null;
    this._bgCacheDirty = true;
    this._bgCacheW = 0;
    this._bgCacheH = 0;

    // Salary visual effect
    this.salaryEffect = null;
    // Cash register animation
    this.registerAnim = { active: false, frame: 0, maxFrame: 45 };

    this._bindEvents();
  }

  _bindEvents() {
    this.canvas.addEventListener("mousemove", (e) => this._onMouseMove(e));
    this.canvas.addEventListener("click", (e) => this._onClick(e));
    this.canvas.addEventListener("mousedown", (e) => this._onMouseDown(e));
    this.canvas.addEventListener("mouseup", (e) => this._onMouseUp(e));
  }

  _getMousePos(e) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  _onMouseMove(e) {
    const pos = this._getMousePos(e);

    if (this.editMode && this.dragTarget) {
      const w = this.canvas.width;
      const h = this.canvas.height;
      const newX = (pos.x - this.dragOffset.x) / w;
      const newY = (pos.y - this.dragOffset.y) / h;

      if (this.dragTarget.type === 'table') {
        const idx = this.dragTarget.index;
        const seat = this.restaurant.seats[idx];
        seat.x = pos.x - this.dragOffset.x;
        seat.y = pos.y - this.dragOffset.y;
        // Clamp to floor area
        const floorY = h * 0.35 + 20;
        const floorEnd = h - 90;
        seat.y = Math.max(floorY, Math.min(floorEnd, seat.y));
        seat.x = Math.max(40, Math.min(w - 40, seat.x));
      } else if (this.dragTarget.type === 'decoration') {
        const placed = this.decorationState.placed[this.dragTarget.index];
        const item = findItemById(placed.id);
        const isWallItem = item && (item.category === 'wall_art' || item.category === 'lighting' || item.category === 'curtains' || item.category === 'appliances');
        placed.x = Math.max(0.03, Math.min(0.97, newX));
        if (isWallItem) {
          placed.y = Math.max(0.02, Math.min(0.32, newY));
        } else {
          placed.y = Math.max(0.35, Math.min(0.85, newY));
        }
      }
      this.canvas.style.cursor = "grabbing";
      return;
    }

    if (this.editMode) {
      this.hoveredDragItem = this._hitTestDraggable(pos);
      this.canvas.style.cursor = this.hoveredDragItem ? "grab" : "default";
      return;
    }

    this.hoveredCustomer = null;
    for (const c of this.customers) {
      c.highlighted = false;
      if (c.clickable && c.containsPoint(pos.x, pos.y)) {
        c.highlighted = true;
        this.hoveredCustomer = c;
      }
    }
    this.canvas.style.cursor = this.hoveredCustomer ? "pointer" : "default";
  }

  _onMouseDown(e) {
    if (!this.editMode) return;
    const pos = this._getMousePos(e);
    const hit = this._hitTestDraggable(pos);
    if (hit) {
      this.dragTarget = hit;
      if (hit.type === 'table') {
        const seat = this.restaurant.seats[hit.index];
        this.dragOffset.x = pos.x - seat.x;
        this.dragOffset.y = pos.y - seat.y;
      } else if (hit.type === 'decoration') {
        const placed = this.decorationState.placed[hit.index];
        this.dragOffset.x = pos.x - placed.x * this.canvas.width;
        this.dragOffset.y = pos.y - placed.y * this.canvas.height;
      }
      this.canvas.style.cursor = "grabbing";
    }
  }

  _onMouseUp(e) {
    if (!this.editMode || !this.dragTarget) return;
    const w = this.canvas.width;
    const h = this.canvas.height;

    if (this.dragTarget.type === 'table') {
      const idx = this.dragTarget.index;
      const seat = this.restaurant.seats[idx];
      this.onPositionChanged({
        type: 'table',
        index: idx,
        x: seat.x / w,
        y: seat.y / h
      });
    } else if (this.dragTarget.type === 'decoration') {
      const placed = this.decorationState.placed[this.dragTarget.index];
      this.onPositionChanged({
        type: 'decoration',
        index: this.dragTarget.index,
        x: placed.x,
        y: placed.y
      });
    }

    this.dragTarget = null;
    this.canvas.style.cursor = "grab";
  }

  _hitTestDraggable(pos) {
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Test tables
    for (let i = 0; i < this.restaurant.seats.length; i++) {
      const seat = this.restaurant.seats[i];
      if (Math.abs(pos.x - seat.x) < 40 && Math.abs(pos.y - seat.y) < 25) {
        return { type: 'table', index: i };
      }
    }

    // Test placed decorations
    for (let i = 0; i < this.decorationState.placed.length; i++) {
      const placed = this.decorationState.placed[i];
      const item = findItemById(placed.id);
      if (!item) continue;
      const px = placed.x * w;
      const py = placed.y * h;
      const hw = (item.render.width || 40) / 2;
      const hh = (item.render.height || 40) / 2;
      if (Math.abs(pos.x - px) < hw + 5 && Math.abs(pos.y - py) < hh + 5) {
        return { type: 'decoration', index: i };
      }
    }

    return null;
  }

  _onClick(e) {
    if (this.editMode) return;
    const pos = this._getMousePos(e);
    for (const c of this.customers) {
      if (c.clickable && c.containsPoint(pos.x, pos.y)) {
        this.onCustomerClick(c);
        return;
      }
    }
  }

  start() {
    this.running = true;
    this._loop();
  }

  stop() {
    this.running = false;
  }

  setEditMode(enabled) {
    this.editMode = enabled;
    this.dragTarget = null;
    this.hoveredDragItem = null;
    if (!enabled) {
      this.canvas.style.cursor = "default";
    }
  }

  updateDecorationState(state) {
    const changed = this.decorationState.activeWallpaper !== state.activeWallpaper ||
                    this.decorationState.activeFloor !== state.activeFloor;
    this.decorationState = { ...state };
    if (changed) this._bgCacheDirty = true;
  }

  updateBonuses(tipBonus, patienceBonus) {
    this.tipBonus = tipBonus;
    this.patienceBonus = patienceBonus;
  }

  updateDishes(dishes) {
    this.dishes = dishes;
  }

  updateSeats(count, customPositions) {
    this.restaurant.maxSeats = count;
    this.restaurant.seats = this.restaurant.generateSeats(count, customPositions, this.canvas.width, this.canvas.height);
  }

  updateStaff(staff) {
    this.staff = staff;
    this._assignStaffPositions();
  }

  _assignStaffPositions() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    const cy = h - 70;
    let waiterX = 80;
    let cashierX = w - 150;
    for (const s of this.staff) {
      if (s.homeX === 0 && s.homeY === 0) {
        if (s.type === "cashier") {
          s.setHomePosition(cashierX, cy - 15);
          cashierX -= 35;
        } else {
          s.setHomePosition(waiterX, cy - 15);
          waiterX += 40;
        }
      }
    }
  }

  triggerSalaryEffect(amount) {
    this.salaryEffect = { amount, life: 90, maxLife: 90 };
    for (let i = 0; i < 6; i++) {
      this.particles.push({
        x: this.canvas.width / 2 + (Math.random() - 0.5) * 60,
        y: 10,
        vx: (Math.random() - 0.5) * 2,
        vy: Math.random() * 2 + 1,
        life: 50,
        maxLife: 50,
        alpha: 1,
        color: "#e74c3c",
        size: Math.random() * 3 + 2,
      });
    }
    this.floatingTexts.push({
      x: this.canvas.width / 2,
      y: 50,
      text: `💸 -${amount} 薪资支出`,
      color: "#e74c3c",
      size: 16,
      life: 80,
      maxLife: 80,
      alpha: 1,
    });
  }

  invalidateBgCache() {
    this._bgCacheDirty = true;
  }

  _loop() {
    if (!this.running) return;
    this.frameCount++;
    this._update();
    this._render();
    requestAnimationFrame(() => this._loop());
  }

  _update() {
    this.spawnTimer++;
    if (this.spawnTimer >= this.spawnInterval && this.dishes.length > 0) {
      this._spawnCustomer();
      this.spawnTimer = 0;
      this.spawnInterval = 150 + Math.random() * 150;
    }

    for (const c of this.customers) {
      const prevState = c.state;
      c.update();

      if (prevState === "paying" && c.state === "leaving") {
        this.restaurant.releaseSeat(c.seatIndex);
        this.onServeCustomer();
      }
    }

    this.customers = this.customers.filter((c) => !c.isDone());

    for (const s of this.staff) {
      const result = s.update(this.customers, this);
      if (result && result.type !== "started") {
        this._handleStaffResult(result);
      }
    }

    if (this.salaryEffect) {
      this.salaryEffect.life--;
      if (this.salaryEffect.life <= 0) this.salaryEffect = null;
    }

    if (this.registerAnim.active) {
      this.registerAnim.frame++;
      if (this.registerAnim.frame >= this.registerAnim.maxFrame) {
        this.registerAnim.active = false;
      }
    }

    this.particles = this.particles.filter((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.06;
      p.life--;
      p.alpha = p.life / p.maxLife;
      return p.life > 0;
    });

    this.floatingTexts = this.floatingTexts.filter((t) => {
      t.y -= 0.8;
      t.life--;
      t.alpha = t.life / t.maxLife;
      return t.life > 0;
    });
  }

  _handleStaffResult(result) {
    if (result.type === "checkout_done") {
      this.onEarnCoins(result.payment);
      this._spawnCoinEffect(result.customer.x, result.customer.y - 30, result.payment);
      this._addBill(result.customer, result.payment, result.staff);
      this.registerAnim = { active: true, frame: 0, maxFrame: 45 };
    } else if (result.type === "dish_served") {
      this._spawnServeSuccessEffect(result.customer.x, result.customer.y - 20, result.customer.orderedDish);
      this._spawnStaffEffect(result.customer.x, result.customer.y - 40, result.staff);
    } else if (result.type === "order_taken") {
      this._spawnStaffEffect(result.customer.x, result.customer.y - 40, result.staff);
    }
    this.onStaffAction(result);
  }

  _spawnCustomer() {
    const seatIndex = this.restaurant.getFreeSeat();
    if (seatIndex === -1) return;

    const pos = this.restaurant.getSeatPosition(seatIndex);
    const customer = new Customer(this.customerIdCounter++, seatIndex, pos, this.dishes, {
      tipBonus: this.tipBonus,
      patienceBonus: this.patienceBonus
    });
    this.customers.push(customer);
  }

  confirmOrder(customer, dish) {
    customer.confirmOrder(dish || customer.wantedDish);
  }

  serveDish(customer) {
    customer.serveDish();
    this._spawnServeSuccessEffect(customer.x, customer.y - 20, customer.orderedDish);
  }

  checkout(customer) {
    const payment = customer.getPayment();
    customer.checkout();
    this.onEarnCoins(payment);
    this._spawnCoinEffect(customer.x, customer.y - 30, payment);
    this._addBill(customer, payment, null);
    this.registerAnim = { active: true, frame: 0, maxFrame: 45 };
    return payment;
  }

  _addBill(customer, amount, staff) {
    this.billHistory.unshift({
      id: Date.now(),
      customerName: customer.name,
      customerEmoji: customer.emoji,
      dish: customer.orderedDish,
      amount,
      tip: Math.floor(amount - (customer.orderedDish?.price || 0)),
      satisfaction: customer.evaluationMood,
      staffName: staff ? staff.name : "玩家",
      time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
    });
    if (this.billHistory.length > 50) this.billHistory.pop();
  }

  _spawnCoinEffect(x, y, amount) {
    this.floatingTexts.push({
      x, y: y - 20, text: `+${amount}`, color: "#f1c40f",
      size: 22, life: 70, maxLife: 70, alpha: 1, coinIcon: true,
    });
    for (let i = 0; i < 10; i++) {
      this.particles.push({
        x, y, vx: (Math.random() - 0.5) * 6, vy: -Math.random() * 5 - 1,
        life: 40, maxLife: 40, alpha: 1,
        color: Math.random() > 0.5 ? "#f1c40f" : "#f39c12",
        size: Math.random() * 5 + 2,
      });
    }
  }

  _spawnStaffEffect(x, y, staff) {
    this.floatingTexts.push({
      x, y: y - 10, text: `✨ ${staff.name} 完成!`, color: "#3498db",
      size: 14, life: 55, maxLife: 55, alpha: 1,
    });
    for (let i = 0; i < 6; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 20, y,
        vx: (Math.random() - 0.5) * 3, vy: -Math.random() * 3 - 0.5,
        life: 30, maxLife: 30, alpha: 1,
        color: ["#74b9ff", "#a29bfe", "#81ecec"][Math.floor(Math.random() * 3)],
        size: Math.random() * 4 + 1.5,
      });
    }
  }

  _spawnServeSuccessEffect(x, y, dish) {
    for (let i = 0; i < 12; i++) {
      const angle = ((Math.PI * 2) / 12) * i;
      this.particles.push({
        x, y: y - 10, vx: Math.cos(angle) * 4, vy: Math.sin(angle) * 4 - 2,
        life: 35, maxLife: 35, alpha: 1,
        color: ["#f1c40f", "#e67e22", "#2ecc71", "#fff"][i % 4],
        size: Math.random() * 4 + 2,
      });
    }
    this.floatingTexts.push({
      x, y: y - 25, text: `${dish?.emoji || "🍲"} ✓`, color: "#27ae60",
      size: 20, life: 50, maxLife: 50, alpha: 1,
    });
    this.floatingTexts.push({
      x, y: y - 50, text: "上菜成功!", color: "#f39c12",
      size: 16, life: 60, maxLife: 60, alpha: 1,
    });
    this.particles.push({
      x, y: y - 10, vx: 0, vy: 0, life: 25, maxLife: 25,
      alpha: 0.8, color: "#f1c40f", size: 5, ring: true,
    });
  }

  // ===== RENDER =====

  _render() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    this._drawBackgroundCached(ctx, w, h);
    this._drawWalls(ctx, w, h);
    this._drawPlacedDecorations(ctx, w, h);
    drawAmbientLighting(ctx, w, h, this.decorationState.placed);
    this._drawTables(ctx);
    this._drawCustomers(ctx);
    this._drawStaffCharacters(ctx);
    this._drawParticles(ctx);
    this._drawFloatingTexts(ctx);
    this._drawCashierCounter(ctx, w, h);
    this._drawSalaryEffect(ctx, w, h);
    drawVignette(ctx, w, h);

    if (this.editMode) {
      this._drawEditModeOverlay(ctx, w, h);
    }
  }

  _drawBackgroundCached(ctx, w, h) {
    if (this._bgCacheDirty || this._bgCacheW !== w || this._bgCacheH !== h) {
      this._bgCacheW = w;
      this._bgCacheH = h;
      if (!this._bgCache) {
        this._bgCache = document.createElement('canvas');
      }
      this._bgCache.width = w;
      this._bgCache.height = h;
      const bctx = this._bgCache.getContext('2d');

      // Draw wall
      const wallH = h * 0.35;
      this._drawWallPattern(bctx, w, h, wallH);

      // Draw ceiling molding
      drawCeilingMolding(bctx, w);

      // Draw baseboard
      drawBaseboard(bctx, w, wallH);

      // Draw floor
      const floorY = wallH;
      const floorH = h - wallH - 70;
      this._drawFloorPattern(bctx, w, floorY, floorH);

      this._bgCacheDirty = false;
    }
    ctx.drawImage(this._bgCache, 0, 0);
  }

  _drawWallPattern(ctx, w, h, wallH) {
    switch (this.decorationState.activeWallpaper) {
      case 'wp_brick': drawBrickWall(ctx, w, h, wallH); break;
      case 'wp_stripe': drawStripeWall(ctx, w, h, wallH); break;
      case 'wp_floral': drawFloralWall(ctx, w, h, wallH); break;
      default: drawCreamWall(ctx, w, h, wallH); break;
    }
  }

  _drawFloorPattern(ctx, w, floorY, floorH) {
    switch (this.decorationState.activeFloor) {
      case 'fl_checker': drawCheckerFloor(ctx, w, floorY, floorH); break;
      case 'fl_terracotta': drawTerracottaFloor(ctx, w, floorY, floorH); break;
      case 'fl_marble': drawMarbleFloor(ctx, w, floorY, floorH); break;
      default: drawWoodFloor(ctx, w, floorY, floorH); break;
    }
  }

  _drawWalls(ctx, w, h) {
    const wallH = h * 0.35;

    // Windows with light shafts
    this._drawWindow(ctx, 80, 60, 100, 85);
    this._drawWindow(ctx, w - 180, 60, 100, 85);
    drawWindowLightShaft(ctx, 80, 60, 100, 85, wallH);
    drawWindowLightShaft(ctx, w - 180, 60, 100, 85, wallH);

    // Title
    ctx.save();
    ctx.font = `bold 26px ${FONT}`;
    ctx.textAlign = "center";
    ctx.fillStyle = "#d35400";
    ctx.shadowColor = "rgba(211, 84, 0, 0.3)";
    ctx.shadowBlur = 12;
    ctx.fillText("🏠 欢乐小餐厅 🏠", w / 2, 42);
    ctx.restore();

    const pulse = Math.sin(Date.now() * 0.003) * 0.3 + 0.7;
    ctx.save();
    ctx.globalAlpha = pulse;
    ctx.font = `14px ${FONT}`;
    ctx.textAlign = "center";
    ctx.fillStyle = "#27ae60";
    ctx.fillText("✨ 营业中 ✨", w / 2, 64);
    ctx.restore();
  }

  _drawWindow(ctx, x, y, w, h) {
    ctx.save();
    ctx.shadowColor = "rgba(135, 206, 235, 0.4)";
    ctx.shadowBlur = 12;

    // Window opening with sky gradient
    const skyGrad = ctx.createLinearGradient(x, y, x, y + h);
    skyGrad.addColorStop(0, '#a8d8ea');
    skyGrad.addColorStop(0.6, '#87CEEB');
    skyGrad.addColorStop(1, '#b8e6f0');
    ctx.fillStyle = skyGrad;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 6);
    ctx.fill();
    ctx.restore();

    // Window sill depth
    ctx.fillStyle = '#6B4513';
    ctx.fillRect(x - 3, y + h, w + 6, 6);
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fillRect(x - 3, y + h, w + 6, 2);

    // Frame with depth
    ctx.strokeStyle = "#5D3A1A";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 6);
    ctx.stroke();

    // Inner frame highlight
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x + 3, y + 3, w - 6, h - 6, 4);
    ctx.stroke();

    // Cross panes
    ctx.strokeStyle = "#5D3A1A";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + w / 2, y);
    ctx.lineTo(x + w / 2, y + h);
    ctx.moveTo(x, y + h / 2);
    ctx.lineTo(x + w, y + h / 2);
    ctx.stroke();

    // Curtains with depth
    ctx.fillStyle = "rgba(255, 182, 193, 0.6)";
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + w * 0.2, y + 25, x, y + 35);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + w, y);
    ctx.quadraticCurveTo(x + w * 0.8, y + 25, x + w, y + 35);
    ctx.fill();

    // Curtain inner shadow
    ctx.fillStyle = "rgba(200, 130, 150, 0.3)";
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + w * 0.12, y + 18, x, y + 28);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + w, y);
    ctx.quadraticCurveTo(x + w * 0.88, y + 18, x + w, y + 28);
    ctx.fill();
  }

  _drawPlacedDecorations(ctx, w, h) {
    for (let i = 0; i < this.decorationState.placed.length; i++) {
      const placed = this.decorationState.placed[i];
      const item = findItemById(placed.id);
      if (!item || !item.render.drawFn) continue;

      const drawFn = DECORATION_DRAW_FNS[item.render.drawFn];
      if (!drawFn) continue;

      const px = placed.x * w;
      const py = placed.y * h;
      const dw = item.render.width || 40;
      const dh = item.render.height || 40;

      ctx.save();
      drawFn(ctx, px, py, dw, dh);

      // Edit mode highlight
      if (this.editMode && this.hoveredDragItem &&
          this.hoveredDragItem.type === 'decoration' && this.hoveredDragItem.index === i) {
        ctx.strokeStyle = 'rgba(241, 196, 15, 0.8)';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(px - dw / 2 - 3, py - dh / 2 - 3, dw + 6, dh + 6);
        ctx.setLineDash([]);
      }
      ctx.restore();
    }
  }

  _drawTables(ctx) {
    for (let i = 0; i < this.restaurant.seats.length; i++) {
      const seat = this.restaurant.seats[i];
      draw3DTable(ctx, seat.x, seat.y, seat.tableStyle, seat.occupied, i);

      // Edit mode highlight
      if (this.editMode && this.hoveredDragItem &&
          this.hoveredDragItem.type === 'table' && this.hoveredDragItem.index === i) {
        ctx.strokeStyle = 'rgba(241, 196, 15, 0.8)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(seat.x - 42, seat.y - 20, 84, 56);
        ctx.setLineDash([]);
      }
    }
  }

  _drawEditModeOverlay(ctx, w, h) {
    // Border indicator
    ctx.save();
    ctx.strokeStyle = 'rgba(241, 196, 15, 0.6)';
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 5]);
    ctx.strokeRect(2, 2, w - 4, h - 4);
    ctx.setLineDash([]);

    // Label
    ctx.fillStyle = 'rgba(241, 196, 15, 0.9)';
    ctx.beginPath();
    ctx.roundRect(w / 2 - 50, 8, 100, 22, 11);
    ctx.fill();
    ctx.font = `bold 11px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#333';
    ctx.fillText('✏️ 编辑模式', w / 2, 23);
    ctx.restore();
  }

  _drawCustomers(ctx) {
    for (const c of this.customers) {
      ctx.save();
      ctx.globalAlpha = c.alpha;

      const bounce = Math.sin(c.bouncePhase) * 2.5;
      const y = c.y + bounce;

      if (c.highlighted) {
        ctx.beginPath();
        ctx.arc(c.x, y + 5, 30, 0, Math.PI * 2);
        const glowGrad = ctx.createRadialGradient(c.x, y + 5, 0, c.x, y + 5, 30);
        glowGrad.addColorStop(0, "rgba(241, 196, 15, 0.2)");
        glowGrad.addColorStop(1, "rgba(241, 196, 15, 0)");
        ctx.fillStyle = glowGrad;
        ctx.fill();
        ctx.strokeStyle = "rgba(241, 196, 15, 0.6)";
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      if (c._beingServedBy && c._beingServedBy.busy && !c._beingServedBy.moving) {
        this._drawServingIndicator(ctx, c, c.x, y);
      }

      drawCustomerBody(ctx, c.x, y, c, this.frameCount);

      ctx.font = "14px serif";
      ctx.textAlign = "center";
      ctx.fillText(c.getMoodEmoji(), c.x + 20, y - 22);

      if (c.state !== "walking_in" && c.state !== "leaving" && c.state !== "paying") {
        this._drawPatienceBar(ctx, c.x, y - 38, c.patience);
        this._drawPatienceCountdown(ctx, c.x, y - 38, c);
      }

      if (c.patience < 30 && c.state !== "leaving" && c.state !== "paying" && c.state !== "eating") {
        const glowAlpha = 0.2 + Math.sin(this.frameCount * 0.12) * 0.15;
        ctx.beginPath();
        ctx.arc(c.x, y + 5, 32, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(231, 76, 60, ${glowAlpha})`;
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      this._drawDialogueBubble(ctx, c, c.x, y);

      if (c.clickable && c.highlighted) {
        ctx.font = `bold 11px ${FONT}`;
        ctx.fillStyle = "#f39c12";
        ctx.textAlign = "center";
        const hintBounce = Math.sin(this.frameCount * 0.08) * 2;
        ctx.fillText(c.interactionHint, c.x, y + 40 + hintBounce);
      }

      ctx.restore();
    }
  }

  _drawServingIndicator(ctx, customer, x, y) {
    const staff = customer._beingServedBy;
    const progress = 1 - staff.busyTimer / staff.busyMaxTimer;
    const actionText = staff.showingAction || "服务中";

    const badgeY = y - 78;
    const pulseScale = 1 + Math.sin(this.frameCount * 0.1) * 0.05;

    ctx.save();
    ctx.translate(x, badgeY);
    ctx.scale(pulseScale, pulseScale);

    ctx.beginPath();
    ctx.roundRect(-42, -12, 84, 24, 12);
    ctx.fillStyle = "rgba(52, 152, 219, 0.9)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.4)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.font = `bold 10px ${FONT}`;
    ctx.textAlign = "center";
    ctx.fillStyle = "#fff";
    ctx.fillText(`${staff.emoji} ${actionText}`, 0, 3);

    ctx.beginPath();
    ctx.roundRect(-36, 8, 72, 3, 2);
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(-36, 8, 72 * progress, 3, 2);
    ctx.fillStyle = "#fff";
    ctx.fill();

    ctx.restore();

    ctx.beginPath();
    ctx.setLineDash([3, 3]);
    ctx.moveTo(x, badgeY + 12);
    ctx.lineTo(x, y - 62);
    ctx.strokeStyle = "rgba(52, 152, 219, 0.4)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.setLineDash([]);
  }

  _drawPatienceBar(ctx, x, y, patience) {
    const w = 44;
    const h = 6;
    ctx.beginPath();
    ctx.roundRect(x - w / 2 - 1, y - 1, w + 2, h + 2, 4);
    ctx.fillStyle = "rgba(0,0,0,0.15)";
    ctx.fill();

    ctx.beginPath();
    ctx.roundRect(x - w / 2, y, w, h, 3);
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.fill();

    const color = patience > 60 ? "#2ecc71" : patience > 30 ? "#f39c12" : "#e74c3c";
    ctx.beginPath();
    ctx.roundRect(x - w / 2, y, w * (patience / 100), h, 3);
    ctx.fillStyle = color;
    ctx.fill();
  }

  _drawPatienceCountdown(ctx, x, y, customer) {
    const seconds = customer.getRemainingSeconds();
    const patience = customer.patience;
    const offsetX = 26;

    ctx.save();

    if (patience < 15) {
      const shake = (Math.random() - 0.5) * 3;
      const pulse = Math.sin(this.frameCount * 0.2) * 0.15 + 1;
      ctx.translate(x + offsetX + shake, y + 4 + shake);
      ctx.scale(pulse, pulse);
      ctx.font = `bold 13px ${FONT}`;
      ctx.textAlign = "left";
      ctx.fillStyle = "#e74c3c";
      ctx.fillText(`${seconds}s`, 0, 0);
      ctx.restore();

      ctx.save();
      if (this.frameCount % 20 < 10) {
        ctx.font = `bold 16px ${FONT}`;
        ctx.fillStyle = "#e74c3c";
        ctx.textAlign = "center";
        ctx.fillText("!", x, y - 14);
      }
      ctx.restore();
    } else if (patience < 30) {
      const pulse = Math.sin(this.frameCount * 0.15) * 0.08 + 1;
      ctx.translate(x + offsetX, y + 4);
      ctx.scale(pulse, pulse);
      ctx.font = `bold 12px ${FONT}`;
      ctx.textAlign = "left";
      ctx.fillStyle = "#e74c3c";
      ctx.fillText(`${seconds}s`, 0, 0);
      ctx.restore();
    } else if (patience < 50) {
      ctx.font = `bold 11px ${FONT}`;
      ctx.textAlign = "left";
      ctx.fillStyle = "#f39c12";
      ctx.fillText(`${seconds}s`, x + offsetX, y + 4);
      ctx.restore();
    } else {
      ctx.font = `10px ${FONT}`;
      ctx.textAlign = "left";
      ctx.fillStyle = "#999";
      ctx.fillText(`${seconds}s`, x + offsetX, y + 4);
      ctx.restore();
    }
  }

  _drawDialogueBubble(ctx, customer, x, y) {
    const dialogue = customer.getDialogue();
    const label = customer.getStateLabel();
    const displayText = dialogue || label;
    if (!displayText) return;

    ctx.font = `12px ${FONT}`;
    const textW = ctx.measureText(displayText).width || 60;
    const bw = Math.max(textW + 20, 60);
    const bh = 28;
    const bx = x - bw / 2;
    const by = y - 62;

    let bgColor = "rgba(255,255,255,0.95)";
    let borderColor = "#e0e0e0";
    if (dialogue && customer.evaluationMood === "angry") {
      bgColor = "rgba(255,235,235,0.95)";
      borderColor = "#ffaaaa";
    } else if (dialogue && customer.evaluationMood === "happy") {
      bgColor = "rgba(235,255,235,0.95)";
      borderColor = "#aaffaa";
    }

    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.08)";
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 2;
    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, 12);
    ctx.fillStyle = bgColor;
    ctx.fill();
    ctx.restore();

    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, 12);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x - 6, by + bh);
    ctx.lineTo(x + 6, by + bh);
    ctx.lineTo(x, by + bh + 7);
    ctx.closePath();
    ctx.fillStyle = bgColor;
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x - 6, by + bh);
    ctx.lineTo(x, by + bh + 7);
    ctx.lineTo(x + 6, by + bh);
    ctx.strokeStyle = borderColor;
    ctx.stroke();

    ctx.font = `11px ${FONT}`;
    ctx.textAlign = "center";
    ctx.fillStyle = dialogue ? "#333" : "#666";
    ctx.fillText(displayText, x, by + 18);

    if (customer.state === "cooking" && customer.cookDuration > 0) {
      const progress = customer.cookProgress / customer.cookDuration;
      const barY = by + bh - 4;
      ctx.fillStyle = "rgba(0,0,0,0.08)";
      ctx.beginPath();
      ctx.roundRect(bx + 6, barY, bw - 12, 3, 2);
      ctx.fill();
      ctx.fillStyle = "#e67e22";
      ctx.beginPath();
      ctx.roundRect(bx + 6, barY, (bw - 12) * progress, 3, 2);
      ctx.fill();
    }

    if (customer.state === "eating" && customer.eatDuration > 0) {
      const progress = customer.eatProgress / customer.eatDuration;
      const barY = by + bh - 4;
      ctx.fillStyle = "rgba(0,0,0,0.08)";
      ctx.beginPath();
      ctx.roundRect(bx + 6, barY, bw - 12, 3, 2);
      ctx.fill();
      ctx.fillStyle = "#27ae60";
      ctx.beginPath();
      ctx.roundRect(bx + 6, barY, (bw - 12) * progress, 3, 2);
      ctx.fill();
    }

    if (customer.orderedDish && (customer.state === "cooking" || customer.state === "ready_to_serve" || customer.state === "eating")) {
      ctx.font = "18px serif";
      ctx.textAlign = "center";
      const dishBounce = Math.sin(this.frameCount * 0.05) * 2;
      ctx.fillText(customer.orderedDish.emoji || "🍲", x, by - 4 + dishBounce);
    }
  }

  _drawStaffCharacters(ctx) {
    for (const s of this.staff) {
      ctx.save();
      ctx.globalAlpha = 1;

      const isMoving = s.moving || s.returning;
      const walkBob = isMoving ? Math.sin(s.walkFrame * 0.15) * 2 : Math.sin(s.animPhase) * 1;
      const sx = s.x;
      const sy = s.y + walkBob;

      if (s.busy && !isMoving) {
        ctx.beginPath();
        ctx.arc(sx, sy, 24, 0, Math.PI * 2);
        const glowIntensity = 0.12 + Math.sin(this.frameCount * 0.08) * 0.05;
        ctx.fillStyle = s.type === "waiter"
          ? `rgba(52, 152, 219, ${glowIntensity})`
          : `rgba(155, 89, 182, ${glowIntensity})`;
        ctx.fill();
      }

      drawStaffBody(ctx, sx, sy, s, this.frameCount);

      ctx.beginPath();
      ctx.roundRect(sx + 11, sy - 8, 20, 12, 6);
      ctx.fillStyle = s.type === "waiter" ? "#2980b9" : "#8e44ad";
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.4)";
      ctx.lineWidth = 0.8;
      ctx.stroke();
      ctx.font = `bold 7px ${FONT}`;
      ctx.textAlign = "center";
      ctx.fillStyle = "#fff";
      ctx.fillText(`Lv${s.level}`, sx + 21, sy);

      if (!isMoving) {
        ctx.font = `9px ${FONT}`;
        ctx.fillStyle = "#555";
        ctx.textAlign = "center";
        ctx.fillText(s.name, sx, sy + 33);
      }

      if (s.busy && !isMoving && s.actionAnim > 0) {
        const actionScale = 1 + Math.sin(s.actionAnim * 0.3) * 0.15;
        ctx.save();
        ctx.translate(sx, sy - 26);
        ctx.scale(actionScale, actionScale);
        ctx.font = "13px serif";
        ctx.textAlign = "center";
        if (s.type === "waiter") {
          const dishEmoji = s.targetCustomer?.orderedDish?.emoji || "🍽️";
          ctx.fillText(dishEmoji, 0, 0);
        } else {
          ctx.fillText("💰", 0, 0);
        }
        ctx.restore();
      }

      if (isMoving && this.frameCount % 5 === 0) {
        this.particles.push({
          x: sx + (Math.random() - 0.5) * 6, y: sy + 20,
          vx: (Math.random() - 0.5) * 0.4, vy: -0.2,
          life: 12, maxLife: 12, alpha: 0.5,
          color: s.type === "waiter" ? "#74b9ff" : "#a29bfe",
          size: Math.random() * 2 + 1,
        });
      }

      for (const sp of s.sparkles) {
        ctx.save();
        ctx.globalAlpha = sp.alpha;
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
        ctx.fillStyle = s.type === "waiter" ? "#74b9ff" : "#a29bfe";
        ctx.fill();
        ctx.restore();
      }

      ctx.restore();
    }
  }

  _drawParticles(ctx) {
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      if (p.ring) {
        const expansion = (1 - p.life / p.maxLife) * 35;
        ctx.beginPath();
        ctx.arc(p.x, p.y, expansion, 0, Math.PI * 2);
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2.5 * (p.life / p.maxLife);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      }
      ctx.restore();
    }
  }

  _drawFloatingTexts(ctx) {
    for (const t of this.floatingTexts) {
      ctx.save();
      ctx.globalAlpha = t.alpha;
      ctx.font = `bold ${t.size}px ${FONT}`;
      ctx.textAlign = "center";
      ctx.fillStyle = t.color;
      ctx.shadowColor = "rgba(0,0,0,0.2)";
      ctx.shadowBlur = 4;
      ctx.fillText(t.text, t.x, t.y);
      if (t.coinIcon) {
        const textW = ctx.measureText(t.text).width;
        this._drawCoinIcon(ctx, t.x + textW / 2 + 12, t.y - 4, 8);
      }
      ctx.restore();
    }
  }

  _drawCoinIcon(ctx, x, y, size) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = "#f1c40f";
    ctx.fill();
    ctx.strokeStyle = "#b8860b";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y, size * 0.6, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(184, 134, 11, 0.4)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.font = `bold ${Math.floor(size * 1.1)}px ${FONT}`;
    ctx.textAlign = "center";
    ctx.fillStyle = "#8B6914";
    ctx.shadowBlur = 0;
    ctx.fillText("¥", x, y + size * 0.4);
    ctx.restore();
  }

  _drawCashierCounter(ctx, w, h) {
    const cy = h - 70;
    const counterH = 70;

    const grad = ctx.createLinearGradient(0, cy, 0, h);
    grad.addColorStop(0, "#7d5c3a");
    grad.addColorStop(0.2, "#6d4c2a");
    grad.addColorStop(0.6, "#5d3f22");
    grad.addColorStop(1, "#3e2a15");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(0, cy, w, counterH, [12, 12, 0, 0]);
    ctx.fill();

    // Counter top highlight
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.fillRect(0, cy, w, 4);

    // Counter depth/front face
    ctx.fillStyle = "rgba(0,0,0,0.1)";
    ctx.fillRect(0, cy + 4, w, 3);

    const cashierX = w - 160;
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,0.04)";
    ctx.beginPath();
    ctx.roundRect(cashierX - 20, cy + 6, 180, counterH - 12, 10);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    this._drawCashRegister(ctx, cashierX + 20, cy + 12);

    ctx.font = `11px ${FONT}`;
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.textAlign = "center";
    ctx.fillText("收银台", cashierX + 20, cy + 62);

    ctx.font = "20px serif";
    ctx.textAlign = "center";
    ctx.fillText("🧾", cashierX + 80, cy + 40);
    ctx.fillText("💵", cashierX + 120, cy + 40);

    ctx.font = "28px serif";
    ctx.textAlign = "center";
    ctx.fillText("🧑‍🍳", 45, cy + 45);
    ctx.font = `11px ${FONT}`;
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.fillText("厨房", 45, cy + 60);

    ctx.font = "24px serif";
    ctx.fillText("📋", 110, cy + 40);

    const bellBounce = Math.sin(this.frameCount * 0.06) * 1.5;
    ctx.fillText("🔔", 160, cy + 38 + bellBounce);

    const dishStartX = 210;
    for (let i = 0; i < Math.min(this.dishes.length, 6); i++) {
      ctx.font = "20px serif";
      const dishFloat = Math.sin(this.frameCount * 0.03 + i * 0.5) * 1.5;
      ctx.fillText(this.dishes[i].emoji || "🍲", dishStartX + i * 42, cy + 40 + dishFloat);
    }
  }

  _drawCashRegister(ctx, x, y) {
    const anim = this.registerAnim;
    const isAnimating = anim.active;
    const animProgress = isAnimating ? anim.frame / anim.maxFrame : 0;

    ctx.save();

    const bodyGrad = ctx.createLinearGradient(x - 18, y, x + 18, y + 36);
    bodyGrad.addColorStop(0, "#666");
    bodyGrad.addColorStop(0.5, "#888");
    bodyGrad.addColorStop(1, "#555");
    ctx.beginPath();
    ctx.roundRect(x - 18, y, 36, 36, 4);
    ctx.fillStyle = bodyGrad;
    ctx.fill();
    ctx.strokeStyle = "#444";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    const screenGlow = isAnimating ? 0.3 + Math.sin(anim.frame * 0.3) * 0.2 : 0;
    ctx.beginPath();
    ctx.roundRect(x - 13, y + 3, 26, 12, 2);
    ctx.fillStyle = isAnimating ? `rgba(0, 255, 100, ${0.8 + screenGlow})` : "#1a3a1a";
    ctx.fill();
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 0.5;
    ctx.stroke();

    ctx.font = `bold 7px monospace`;
    ctx.textAlign = "center";
    ctx.fillStyle = isAnimating ? "#fff" : "#0f0";
    ctx.fillText(isAnimating ? "¥ OK!" : "¥", x, y + 12);

    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 3; col++) {
        ctx.beginPath();
        ctx.roundRect(x - 11 + col * 8, y + 17 + row * 7, 5, 5, 1);
        ctx.fillStyle = "#aaa";
        ctx.fill();
      }
    }

    const drawerOpen = isAnimating ? Math.sin(animProgress * Math.PI) * 8 : 0;
    ctx.beginPath();
    ctx.roundRect(x - 16, y + 33 + drawerOpen, 32, 6, 2);
    ctx.fillStyle = "#777";
    ctx.fill();
    ctx.strokeStyle = "#555";
    ctx.lineWidth = 0.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x - 6, y + 35 + drawerOpen);
    ctx.lineTo(x + 6, y + 35 + drawerOpen);
    ctx.strokeStyle = "#444";
    ctx.lineWidth = 1;
    ctx.stroke();

    if (isAnimating && anim.frame < 20 && anim.frame % 4 === 0) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 20, y: y + 10,
        vx: (Math.random() - 0.5) * 3, vy: -Math.random() * 3 - 1,
        life: 30, maxLife: 30, alpha: 1,
        color: Math.random() > 0.5 ? "#f1c40f" : "#f39c12",
        size: Math.random() * 3 + 1.5,
      });
    }

    ctx.restore();
  }

  _drawSalaryEffect(ctx, w, h) {
    if (!this.salaryEffect) return;
    const e = this.salaryEffect;
    const alpha = e.life / e.maxLife;

    ctx.save();
    ctx.globalAlpha = alpha * 0.3;
    const grad = ctx.createLinearGradient(0, 0, 0, 30);
    grad.addColorStop(0, "#e74c3c");
    grad.addColorStop(1, "transparent");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, 30);
    ctx.restore();
  }
}
