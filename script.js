// Global Variables
let currentUser = null
let isLoggedIn = false
const tradingData = {}
let realTimeInterval = null

// Initialize Application
document.addEventListener("DOMContentLoaded", () => {
  initializeApp()
})

function initializeApp() {
  // Check if user is logged in
  checkAuthStatus()

  // Initialize navigation
  initializeNavigation()

  // Initialize animations
  initializeAnimations()

  // Initialize counters
  initializeCounters()

  // Start real-time updates if on trading page
  if (document.body.classList.contains("trading-page")) {
    initializeTradingPage()
  }

  // Initialize auth pages
  if (document.body.classList.contains("auth-page")) {
    initializeAuthPage()
  }
}

// Authentication Functions
function checkAuthStatus() {
  const token = localStorage.getItem("authToken")
  const userData = localStorage.getItem("userData")

  if (token && userData) {
    isLoggedIn = true
    currentUser = JSON.parse(userData)
    updateUIForLoggedInUser()
  }
}

function updateUIForLoggedInUser() {
  const loginBtn = document.querySelector(".btn-login")
  const registerBtn = document.querySelector(".btn-register")

  if (loginBtn && registerBtn) {
    loginBtn.style.display = "none"
    registerBtn.textContent = "لوحة التحكم"
    registerBtn.href = "trading.html"
  }
}

// Navigation Functions
function initializeNavigation() {
  const hamburger = document.querySelector(".hamburger")
  const navMenu = document.querySelector(".nav-menu")

  if (hamburger && navMenu) {
    hamburger.addEventListener("click", () => {
      navMenu.classList.toggle("active")
      hamburger.classList.toggle("active")
    })
  }

  // Smooth scrolling for navigation links
  const navLinks = document.querySelectorAll('.nav-link[href^="#"]')
  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault()
      const targetId = this.getAttribute("href").substring(1)
      const targetElement = document.getElementById(targetId)

      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }
    })
  })

  // Update active navigation link on scroll
  window.addEventListener("scroll", updateActiveNavLink)
}

function updateActiveNavLink() {
  const sections = document.querySelectorAll("section[id]")
  const navLinks = document.querySelectorAll('.nav-link[href^="#"]')

  let currentSection = ""

  sections.forEach((section) => {
    const sectionTop = section.offsetTop - 100
    const sectionHeight = section.offsetHeight

    if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
      currentSection = section.getAttribute("id")
    }
  })

  navLinks.forEach((link) => {
    link.classList.remove("active")
    if (link.getAttribute("href") === `#${currentSection}`) {
      link.classList.add("active")
    }
  })
}

// Animation Functions
function initializeAnimations() {
  // Intersection Observer for fade-in animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate-in")
      }
    })
  }, observerOptions)

  // Observe elements for animation
  const animateElements = document.querySelectorAll(".feature-card, .security-item, .info-card")
  animateElements.forEach((el) => {
    observer.observe(el)
  })

  // Parallax effect for hero section
  window.addEventListener("scroll", () => {
    const scrolled = window.pageYOffset
    const parallaxElements = document.querySelectorAll(".floating-shapes")

    parallaxElements.forEach((element) => {
      const speed = 0.5
      element.style.transform = `translateY(${scrolled * speed}px)`
    })
  })
}

// Counter Animation
function initializeCounters() {
  const counters = document.querySelectorAll("[data-target]")

  const observerOptions = {
    threshold: 0.5,
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target)
        observer.unobserve(entry.target)
      }
    })
  }, observerOptions)

  counters.forEach((counter) => {
    observer.observe(counter)
  })
}

function animateCounter(element) {
  const target = Number.parseInt(element.getAttribute("data-target"))
  const duration = 2000 // 2 seconds
  const step = target / (duration / 16) // 60 FPS
  let current = 0

  const timer = setInterval(() => {
    current += step
    if (current >= target) {
      current = target
      clearInterval(timer)
    }

    if (element.textContent.includes(".")) {
      element.textContent = current.toFixed(1)
    } else {
      element.textContent = Math.floor(current).toLocaleString()
    }
  }, 16)
}

// Trading Page Functions
function initializeTradingPage() {
  initializeTradingCharts()
  startRealTimeData()
  initializeTradingControls()
}

function initializeTradingCharts() {
  // Initialize main chart
  const mainChart = document.getElementById("tradingChart")
  if (mainChart) {
    drawTradingChart(mainChart)
  }

  // Initialize mini charts
  const miniCharts = document.querySelectorAll(".mini-chart canvas")
  miniCharts.forEach((chart) => {
    drawMiniChart(chart)
  })

  // Initialize performance chart
  const performanceChart = document.getElementById("performanceChart")
  if (performanceChart) {
    drawPerformanceChart(performanceChart)
  }
}

function drawTradingChart(canvas) {
  const ctx = canvas.getContext("2d")
  canvas.width = canvas.offsetWidth
  canvas.height = canvas.offsetHeight

  // Generate sample candlestick data
  const data = generateCandlestickData(100)

  // Clear canvas
  ctx.fillStyle = "#1a1a1a"
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Draw grid
  drawGrid(ctx, canvas.width, canvas.height)

  // Draw candlesticks
  drawCandlesticks(ctx, data, canvas.width, canvas.height)

  // Draw indicators
  drawIndicators(ctx, data, canvas.width, canvas.height)
}

function generateCandlestickData(count) {
  const data = []
  let price = 1.08

  for (let i = 0; i < count; i++) {
    const open = price
    const change = (Math.random() - 0.5) * 0.01
    const close = open + change
    const high = Math.max(open, close) + Math.random() * 0.005
    const low = Math.min(open, close) - Math.random() * 0.005
    const volume = Math.random() * 1000 + 500

    data.push({
      timestamp: Date.now() - (count - i) * 60000,
      open,
      high,
      low,
      close,
      volume,
    })

    price = close
  }

  return data
}

function drawGrid(ctx, width, height) {
  const padding = 50
  const gridColor = "#333"

  ctx.strokeStyle = gridColor
  ctx.lineWidth = 1

  // Horizontal lines
  for (let i = 0; i <= 10; i++) {
    const y = padding + ((height - 2 * padding) / 10) * i
    ctx.beginPath()
    ctx.moveTo(padding, y)
    ctx.lineTo(width - padding, y)
    ctx.stroke()
  }

  // Vertical lines
  for (let i = 0; i <= 10; i++) {
    const x = padding + ((width - 2 * padding) / 10) * i
    ctx.beginPath()
    ctx.moveTo(x, padding)
    ctx.lineTo(x, height - padding)
    ctx.stroke()
  }
}

function drawCandlesticks(ctx, data, width, height) {
  const padding = 50
  const chartWidth = width - 2 * padding
  const chartHeight = height - 2 * padding

  // Find price range
  const prices = data.flatMap((d) => [d.high, d.low])
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  const priceRange = maxPrice - minPrice

  const candleWidth = (chartWidth / data.length) * 0.8

  data.forEach((candle, index) => {
    const x = padding + (chartWidth / data.length) * index + (chartWidth / data.length - candleWidth) / 2
    const openY = padding + chartHeight - ((candle.open - minPrice) / priceRange) * chartHeight
    const closeY = padding + chartHeight - ((candle.close - minPrice) / priceRange) * chartHeight
    const highY = padding + chartHeight - ((candle.high - minPrice) / priceRange) * chartHeight
    const lowY = padding + chartHeight - ((candle.low - minPrice) / priceRange) * chartHeight

    const isGreen = candle.close > candle.open
    ctx.fillStyle = isGreen ? "#4CAF50" : "#F44336"
    ctx.strokeStyle = isGreen ? "#4CAF50" : "#F44336"

    // Draw wick
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(x + candleWidth / 2, highY)
    ctx.lineTo(x + candleWidth / 2, lowY)
    ctx.stroke()

    // Draw body
    const bodyTop = Math.min(openY, closeY)
    const bodyHeight = Math.abs(closeY - openY) || 1
    ctx.fillRect(x, bodyTop, candleWidth, bodyHeight)
  })
}

function drawIndicators(ctx, data, width, height) {
  const padding = 50
  const chartWidth = width - 2 * padding
  const chartHeight = height - 2 * padding

  // Calculate moving average
  const ma20 = calculateMovingAverage(data, 20)

  // Find price range
  const prices = data.flatMap((d) => [d.high, d.low])
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  const priceRange = maxPrice - minPrice

  // Draw MA line
  ctx.strokeStyle = "#ff6b35"
  ctx.lineWidth = 2
  ctx.beginPath()

  ma20.forEach((ma, index) => {
    if (ma !== null) {
      const x = padding + (chartWidth / data.length) * index + chartWidth / data.length / 2
      const y = padding + chartHeight - ((ma - minPrice) / priceRange) * chartHeight

      if (index === 0 || ma20[index - 1] === null) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
  })

  ctx.stroke()
}

function calculateMovingAverage(data, period) {
  const ma = []

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      ma.push(null)
    } else {
      let sum = 0
      for (let j = i - period + 1; j <= i; j++) {
        sum += data[j].close
      }
      ma.push(sum / period)
    }
  }

  return ma
}

function drawMiniChart(canvas) {
  const ctx = canvas.getContext("2d")
  const width = canvas.width
  const height = canvas.height

  // Generate sample data
  const points = 20
  const data = []
  let value = 50

  for (let i = 0; i < points; i++) {
    value += (Math.random() - 0.5) * 10
    data.push(Math.max(0, Math.min(100, value)))
  }

  // Clear canvas
  ctx.clearRect(0, 0, width, height)

  // Draw line
  ctx.strokeStyle = Math.random() > 0.5 ? "#4CAF50" : "#F44336"
  ctx.lineWidth = 2
  ctx.beginPath()

  data.forEach((point, index) => {
    const x = (width / (points - 1)) * index
    const y = height - (point / 100) * height

    if (index === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  })

  ctx.stroke()
}

function drawPerformanceChart(canvas) {
  const ctx = canvas.getContext("2d")
  const width = canvas.width
  const height = canvas.height

  // Generate sample performance data
  const data = []
  let balance = 125000

  for (let i = 0; i < 24; i++) {
    balance += (Math.random() - 0.3) * 1000
    data.push(balance)
  }

  // Clear canvas
  ctx.clearRect(0, 0, width, height)

  // Find data range
  const minBalance = Math.min(...data)
  const maxBalance = Math.max(...data)
  const range = maxBalance - minBalance

  // Draw area chart
  ctx.fillStyle = "rgba(76, 175, 80, 0.2)"
  ctx.beginPath()
  ctx.moveTo(0, height)

  data.forEach((point, index) => {
    const x = (width / (data.length - 1)) * index
    const y = height - ((point - minBalance) / range) * height
    ctx.lineTo(x, y)
  })

  ctx.lineTo(width, height)
  ctx.closePath()
  ctx.fill()

  // Draw line
  ctx.strokeStyle = "#4CAF50"
  ctx.lineWidth = 2
  ctx.beginPath()

  data.forEach((point, index) => {
    const x = (width / (data.length - 1)) * index
    const y = height - ((point - minBalance) / range) * height

    if (index === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  })

  ctx.stroke()
}

function startRealTimeData() {
  if (realTimeInterval) {
    clearInterval(realTimeInterval)
  }

  realTimeInterval = setInterval(() => {
    updateRealTimePrices()
    updateAccountStats()
    updateMiniCharts()
  }, 1000)
}

function updateRealTimePrices() {
  const priceElements = document.querySelectorAll(".symbol-item .price")
  const changeElements = document.querySelectorAll(".symbol-item .change")

  priceElements.forEach((priceEl, index) => {
    const currentPrice = Number.parseFloat(priceEl.textContent)
    const change = (Math.random() - 0.5) * 0.001
    const newPrice = currentPrice + change

    priceEl.textContent = newPrice.toFixed(5)

    // Update change
    const changeEl = changeElements[index]
    if (changeEl) {
      const changePercent = (change / currentPrice) * 100
      changeEl.textContent = `${change >= 0 ? "+" : ""}${change.toFixed(5)} (${changePercent >= 0 ? "+" : ""}${changePercent.toFixed(2)}%)`
      changeEl.className = `change ${change >= 0 ? "positive" : "negative"}`
    }
  })

  // Update current symbol price in chart header
  const currentPrice = document.querySelector(".current-price")
  const priceChange = document.querySelector(".price-change")

  if (currentPrice) {
    const price = Number.parseFloat(currentPrice.textContent)
    const change = (Math.random() - 0.5) * 0.001
    const newPrice = price + change

    currentPrice.textContent = newPrice.toFixed(5)

    if (priceChange) {
      const changePercent = (change / price) * 100
      priceChange.textContent = `${change >= 0 ? "+" : ""}${change.toFixed(5)} (${changePercent >= 0 ? "+" : ""}${changePercent.toFixed(2)}%)`
      priceChange.className = `price-change ${change >= 0 ? "positive" : "negative"}`
    }
  }
}

function updateAccountStats() {
  const balanceEl = document.getElementById("accountBalance")
  const pnlEl = document.getElementById("dailyPnL")
  const marginEl = document.getElementById("usedMargin")

  if (balanceEl) {
    const currentBalance = Number.parseFloat(balanceEl.textContent.replace(/[$,]/g, ""))
    const change = (Math.random() - 0.4) * 100
    const newBalance = Math.max(0, currentBalance + change)
    balanceEl.textContent =
      "$" +
      newBalance.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
  }

  if (pnlEl) {
    const currentPnL = Number.parseFloat(pnlEl.textContent.replace(/[+$,]/g, ""))
    const change = (Math.random() - 0.3) * 50
    const newPnL = currentPnL + change
    pnlEl.textContent =
      (newPnL >= 0 ? "+" : "") +
      "$" +
      Math.abs(newPnL).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    pnlEl.className = `value ${newPnL >= 0 ? "positive" : "negative"}`
  }

  if (marginEl) {
    const currentMargin = Number.parseFloat(marginEl.textContent.replace(/[$,]/g, ""))
    const change = (Math.random() - 0.5) * 200
    const newMargin = Math.max(0, currentMargin + change)
    marginEl.textContent =
      "$" +
      newMargin.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
  }
}

function updateMiniCharts() {
  const miniCharts = document.querySelectorAll(".mini-chart canvas")
  miniCharts.forEach((chart) => {
    drawMiniChart(chart)
  })
}

function initializeTradingControls() {
  // Volume controls
  const volumeInput = document.querySelector(".volume-input")
  if (volumeInput) {
    volumeInput.addEventListener("input", updateOrderSummary)
  }

  // Order type selector
  const orderTypeSelect = document.getElementById("orderTypeSelect")
  if (orderTypeSelect) {
    orderTypeSelect.addEventListener("change", function () {
      const limitPriceGroup = document.getElementById("limitPriceGroup")
      if (limitPriceGroup) {
        limitPriceGroup.style.display = this.value === "market" ? "none" : "block"
      }
    })
  }

  // Execute button
  const executeBtn = document.getElementById("executeBtn")
  if (executeBtn) {
    executeBtn.addEventListener("click", executeOrder)
  }

  // Tab switching
  const tabBtns = document.querySelectorAll(".tab-btn")
  tabBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const tabName = this.getAttribute("data-tab")
      switchTab(tabName)
    })
  })

  // Symbol selection
  const symbolItems = document.querySelectorAll(".symbol-item")
  symbolItems.forEach((item) => {
    item.addEventListener("click", function () {
      const symbol = this.getAttribute("data-symbol")
      selectSymbol(symbol)
    })
  })

  // Order type buttons
  const orderTypeBtns = document.querySelectorAll(".order-type-btn")
  orderTypeBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const type = this.getAttribute("data-type")
      selectOrderType(type)
    })
  })

  // Timeframe buttons
  const timeframeBtns = document.querySelectorAll(".timeframe-btn")
  timeframeBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      selectTimeframe(this)
    })
  })
}

function updateOrderSummary() {
  const volumeInput = document.querySelector(".volume-input")
  if (!volumeInput) return

  const volume = Number.parseFloat(volumeInput.value) || 1.0
  const currentPrice = 1.0856 // In a real app, get this from the current symbol
  const leverage = 100 // 1:100 leverage

  const requiredMargin = (volume * 100000 * currentPrice) / leverage
  const pipValue = volume * 10 // $10 per pip for EUR/USD
  const spread = 0.2 // 0.2 pips

  const requiredMarginEl = document.getElementById("requiredMargin")
  const pipValueEl = document.getElementById("pipValue")
  const spreadEl = document.getElementById("spread")

  if (requiredMarginEl) {
    requiredMarginEl.textContent =
      "$" +
      requiredMargin.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
  }

  if (pipValueEl) {
    pipValueEl.textContent = "$" + pipValue.toFixed(2)
  }

  if (spreadEl) {
    spreadEl.textContent = spread + " نقطة"
  }
}

function executeOrder() {
  const executeBtn = document.getElementById("executeBtn")
  if (!executeBtn) return

  executeBtn.classList.add("loading")
  executeBtn.disabled = true

  // Simulate order execution delay
  setTimeout(
    () => {
      executeBtn.classList.remove("loading")
      executeBtn.disabled = false

      // Show success modal
      showOrderSuccessModal()

      // Add to positions (simulate)
      addNewPosition()
    },
    Math.random() * 2000 + 1000,
  ) // 1-3 seconds
}

function showOrderSuccessModal() {
  const modal = document.createElement("div")
  modal.className = "order-modal"
  modal.innerHTML = `
        <div class="modal-content">
            <div class="order-success">
                <i class="fas fa-check-circle"></i>
                <h3>تم تنفيذ الأمر بنجاح!</h3>
                <div class="order-details">
                    <div class="detail-row">
                        <span>الرمز:</span>
                        <span>EUR/USD</span>
                    </div>
                    <div class="detail-row">
                        <span>النوع:</span>
                        <span>شراء</span>
                    </div>
                    <div class="detail-row">
                        <span>الحجم:</span>
                        <span>${document.querySelector(".volume-input")?.value || "1.00"} لوت</span>
                    </div>
                    <div class="detail-row">
                        <span>السعر:</span>
                        <span>1.0856</span>
                    </div>
                    <div class="detail-row">
                        <span>رقم الأمر:</span>
                        <span>#TXN${Date.now()}</span>
                    </div>
                </div>
                <button onclick="closeOrderModal()" class="btn-primary">موافق</button>
            </div>
        </div>
    `

  document.body.appendChild(modal)

  // Auto close after 5 seconds
  setTimeout(() => {
    closeOrderModal()
  }, 5000)
}

function closeOrderModal() {
  const modal = document.querySelector(".order-modal")
  if (modal) {
    modal.remove()
  }
}

function addNewPosition() {
  // This would typically update the positions list
  // For demo purposes, we'll just update the position count
  const positionSummary = document.querySelector(".position-summary .value")
  if (positionSummary) {
    const currentCount = Number.parseInt(positionSummary.textContent) || 0
    positionSummary.textContent = currentCount + 1
  }
}

function switchTab(tabName) {
  // Remove active class from all tabs and contents
  document.querySelectorAll(".tab-btn").forEach((btn) => btn.classList.remove("active"))
  document.querySelectorAll(".tab-content").forEach((content) => content.classList.remove("active"))

  // Add active class to selected tab and content
  const tabBtn = document.querySelector(`[data-tab="${tabName}"]`)
  const tabContent = document.getElementById(`${tabName}-tab`)

  if (tabBtn) tabBtn.classList.add("active")
  if (tabContent) tabContent.classList.add("active")
}

function selectSymbol(symbol) {
  // Remove active class from all symbols
  document.querySelectorAll(".symbol-item").forEach((item) => item.classList.remove("active"))

  // Add active class to selected symbol
  const symbolItem = document.querySelector(`[data-symbol="${symbol}"]`)
  if (symbolItem) {
    symbolItem.classList.add("active")
  }

  // Update chart header
  const currentSymbol = document.querySelector(".current-symbol")
  if (currentSymbol) {
    currentSymbol.textContent = symbol
  }

  // Redraw chart with new symbol data
  const mainChart = document.getElementById("tradingChart")
  if (mainChart) {
    drawTradingChart(mainChart)
  }
}

function selectOrderType(type) {
  // Remove active class from all order type buttons
  document.querySelectorAll(".order-type-btn").forEach((btn) => btn.classList.remove("active"))

  // Add active class to selected button
  const orderTypeBtn = document.querySelector(`[data-type="${type}"]`)
  if (orderTypeBtn) {
    orderTypeBtn.classList.add("active")
  }

  // Update execute button
  const executeBtn = document.getElementById("executeBtn")
  if (executeBtn) {
    executeBtn.className = `execute-btn ${type}`
    executeBtn.innerHTML = `
            <i class="fas fa-bolt"></i>
            <span>تنفيذ أمر ${type === "buy" ? "الشراء" : "البيع"}</span>
        `
  }
}

function selectTimeframe(btn) {
  // Remove active class from all timeframe buttons
  document.querySelectorAll(".timeframe-btn").forEach((b) => b.classList.remove("active"))

  // Add active class to selected button
  btn.classList.add("active")

  // Redraw chart with new timeframe data
  const mainChart = document.getElementById("tradingChart")
  if (mainChart) {
    drawTradingChart(mainChart)
  }
}

// Volume adjustment functions
function adjustVolume(amount) {
  const volumeInput = document.querySelector(".volume-input")
  if (!volumeInput) return

  const currentVolume = Number.parseFloat(volumeInput.value) || 1.0
  const newVolume = Math.max(0.01, currentVolume + amount)
  volumeInput.value = newVolume.toFixed(2)
  updateOrderSummary()
}

function setVolume(volume) {
  const volumeInput = document.querySelector(".volume-input")
  if (!volumeInput) return

  volumeInput.value = volume.toFixed(2)
  updateOrderSummary()
}

// Auth Page Functions
function initializeAuthPage() {
  // Initialize form validation
  initializeFormValidation()

  // Initialize security features
  initializeSecurityFeatures()

  // Start live stats updates
  startLiveStatsUpdates()
}

function initializeFormValidation() {
  const forms = document.querySelectorAll("form")

  forms.forEach((form) => {
    const inputs = form.querySelectorAll("input[required]")

    inputs.forEach((input) => {
      input.addEventListener("blur", function () {
        validateInput(this)
      })

      input.addEventListener("input", function () {
        clearInputError(this)
      })
    })
  })
}

function validateInput(input) {
  const value = input.value.trim()
  const type = input.type
  let isValid = true
  let errorMessage = ""

  if (!value) {
    isValid = false
    errorMessage = "هذا الحقل مطلوب"
  } else if (type === "email" && !isValidEmail(value)) {
    isValid = false
    errorMessage = "يرجى إدخال بريد إلكتروني صحيح"
  } else if (type === "password" && value.length < 8) {
    isValid = false
    errorMessage = "كلمة المرور يجب أن تكون 8 أحرف على الأقل"
  }

  if (!isValid) {
    showInputError(input, errorMessage)
  } else {
    clearInputError(input)
  }

  return isValid
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function showInputError(input, message) {
  input.style.borderColor = "#F44336"

  // Remove existing error message
  const existingError = input.parentElement.querySelector(".error-message")
  if (existingError) {
    existingError.remove()
  }

  // Add new error message
  const errorElement = document.createElement("div")
  errorElement.className = "error-message"
  errorElement.style.color = "#F44336"
  errorElement.style.fontSize = "0.8rem"
  errorElement.style.marginTop = "0.3rem"
  errorElement.textContent = message

  input.parentElement.appendChild(errorElement)
}

function clearInputError(input) {
  input.style.borderColor = ""

  const errorMessage = input.parentElement.querySelector(".error-message")
  if (errorMessage) {
    errorMessage.remove()
  }
}

function initializeSecurityFeatures() {
  // Initialize password strength checker
  const passwordInputs = document.querySelectorAll('input[type="password"]')
  passwordInputs.forEach((input) => {
    if (input.id === "password") {
      input.addEventListener("input", checkPasswordStrength)
    }
  })

  // Initialize CAPTCHA
  const captchaCanvas = document.getElementById("captchaCanvas")
  if (captchaCanvas) {
    generateCaptcha()
  }

  // Initialize biometric authentication
  initializeBiometricAuth()
}

function checkPasswordStrength(e) {
  const password = e.target.value
  const requirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  }

  // Update requirement indicators
  Object.keys(requirements).forEach((req) => {
    const element = document.getElementById(req)
    if (element) {
      const icon = element.querySelector("i")

      if (requirements[req]) {
        element.classList.add("valid")
        if (icon) icon.className = "fas fa-check"
      } else {
        element.classList.remove("valid")
        if (icon) icon.className = "fas fa-times"
      }
    }
  })

  // Update strength bar
  const strengthBar = document.querySelector(".strength-fill")
  const strengthText = document.querySelector(".strength-text")

  if (strengthBar && strengthText) {
    const validCount = Object.values(requirements).filter(Boolean).length
    const strength = (validCount / 5) * 100

    strengthBar.style.width = strength + "%"

    if (strength < 40) {
      strengthBar.style.background = "#F44336"
      strengthText.textContent = "ضعيفة"
    } else if (strength < 80) {
      strengthBar.style.background = "#FF9800"
      strengthText.textContent = "متوسطة"
    } else {
      strengthBar.style.background = "#4CAF50"
      strengthText.textContent = "قوية"
    }
  }
}

function generateCaptcha() {
  const canvas = document.getElementById("captchaCanvas")
  if (!canvas) return

  const ctx = canvas.getContext("2d")

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // Generate random string
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789"
  let captchaText = ""
  for (let i = 0; i < 6; i++) {
    captchaText += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  // Store captcha text globally
  window.captchaText = captchaText

  // Draw background
  ctx.fillStyle = "#f0f0f0"
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Add noise
  for (let i = 0; i < 100; i++) {
    ctx.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.1)`
    ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 2, 2)
  }

  // Draw text with random colors and positions
  ctx.font = "bold 24px Arial"
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"

  for (let i = 0; i < captchaText.length; i++) {
    ctx.fillStyle = `rgb(${Math.random() * 100}, ${Math.random() * 100}, ${Math.random() * 100})`
    const x = (canvas.width / captchaText.length) * (i + 0.5)
    const y = canvas.height / 2 + (Math.random() - 0.5) * 10
    const angle = (Math.random() - 0.5) * 0.4

    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(angle)
    ctx.fillText(captchaText[i], 0, 0)
    ctx.restore()
  }

  // Add distortion lines
  ctx.strokeStyle = "#666"
  ctx.lineWidth = 2
  for (let i = 0; i < 3; i++) {
    ctx.beginPath()
    ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height)
    ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height)
    ctx.stroke()
  }
}

function initializeBiometricAuth() {
  // Simulate biometric authentication availability
  if ("navigator" in window && "credentials" in navigator) {
    // WebAuthn is available
    const biometricBtns = document.querySelectorAll(".biometric-btn")
    biometricBtns.forEach((btn) => {
      btn.addEventListener("click", function () {
        const type = this.querySelector("span").textContent
        simulateBiometricAuth(type)
      })
    })
  }
}

function simulateBiometricAuth(type) {
  const modal = document.createElement("div")
  modal.className = "biometric-modal"
  modal.innerHTML = `
        <div class="modal-content">
            <div class="biometric-scanner">
                <div class="scanner-animation"></div>
                <i class="fas fa-${type.includes("بصمة") ? "fingerprint" : type.includes("وجه") ? "user-circle" : "microphone"}"></i>
            </div>
            <h3>جاري المسح...</h3>
            <p>يرجى ${type.includes("بصمة") ? "وضع إصبعك على الماسح" : type.includes("وجه") ? "النظر إلى الكاميرا" : "التحدث بوضوح"}</p>
            <button onclick="closeBiometricModal()" class="btn-secondary">إلغاء</button>
        </div>
    `

  document.body.appendChild(modal)

  // Simulate authentication process
  setTimeout(() => {
    const scanner = modal.querySelector(".biometric-scanner")
    const title = modal.querySelector("h3")
    const description = modal.querySelector("p")

    scanner.style.borderColor = "#4CAF50"
    scanner.querySelector(".scanner-animation").style.background = "rgba(76, 175, 80, 0.3)"
    title.textContent = "تم التحقق بنجاح!"
    description.textContent = "تم التعرف عليك بنجاح"

    setTimeout(() => {
      closeBiometricModal()
      showAlert("تم التحقق البيومتري بنجاح", "success")
    }, 2000)
  }, 3000)
}

function closeBiometricModal() {
  const modal = document.querySelector(".biometric-modal")
  if (modal) {
    modal.remove()
  }
}

function startLiveStatsUpdates() {
  const activeUsersEl = document.getElementById("activeUsers")
  const dailyProfitEl = document.getElementById("dailyProfit")

  if (activeUsersEl || dailyProfitEl) {
    setInterval(() => {
      if (activeUsersEl) {
        const currentUsers = Number.parseInt(activeUsersEl.textContent.replace(/,/g, ""))
        const change = Math.floor(Math.random() * 20) - 10
        const newUsers = Math.max(800000, currentUsers + change)
        activeUsersEl.textContent = newUsers.toLocaleString()
      }

      if (dailyProfitEl) {
        const currentProfit = Number.parseInt(dailyProfitEl.textContent.replace(/[$,]/g, ""))
        const change = Math.floor(Math.random() * 2000) - 500
        const newProfit = Math.max(2000000, currentProfit + change)
        dailyProfitEl.textContent = "$" + newProfit.toLocaleString()
      }
    }, 3000)
  }
}

// Utility Functions
function showAlert(message, type = "info") {
  const alert = document.createElement("div")
  alert.className = `alert alert-${type}`
  alert.innerHTML = `
        <i class="fas fa-${type === "success" ? "check-circle" : type === "error" ? "exclamation-triangle" : "info-circle"}"></i>
        <span>${message}</span>
    `

  document.body.appendChild(alert)

  // Auto remove after 5 seconds
  setTimeout(() => {
    if (alert.parentElement) {
      alert.remove()
    }
  }, 5000)

  // Remove on click
  alert.addEventListener("click", () => {
    alert.remove()
  })
}

function formatCurrency(amount, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

function formatNumber(number, decimals = 2) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(number)
}

function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

function throttle(func, limit) {
  let inThrottle
  return function () {
    const args = arguments
    
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Error Handling
window.addEventListener("error", (e) => {
  console.error("JavaScript Error:", e.error)
  showAlert("حدث خطأ غير متوقع. يرجى إعادة تحميل الصفحة.", "error")
})

window.addEventListener("unhandledrejection", (e) => {
  console.error("Unhandled Promise Rejection:", e.reason)
  showAlert("حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.", "error")
})

// Cleanup on page unload
window.addEventListener("beforeunload", () => {
  if (realTimeInterval) {
    clearInterval(realTimeInterval)
  }
})

// Export functions for global access
window.adjustVolume = adjustVolume
window.setVolume = setVolume
window.generateCaptcha = generateCaptcha
window.closeBiometricModal = closeBiometricModal
window.closeOrderModal = closeOrderModal
window.showAlert = showAlert
