# Hardware, Construction, Tax & Cash Calculator (Philippine Peso)

A full-featured, mobile-responsive web application designed for hardware store owners, contractors, accountants, cashiers, and civil engineers in the Philippines.

---

## 🛠️ Key Features

### 1. 🪵 Lumber Board Feet Estimator
* **Board Feet (BF) Formula**: Automatically computes board feet using standard dimension math: `(Thickness" × Width" × Length') / 12`.
* **Cost Estimations**: Calculates total price based on unit rate per Board Foot (₱/BF).
* **Presets & Quick Specs**: Quick selection for common Philippine lumber sizes (2x2, 2x3, 2x4, 2x6, 1x12, etc.).

### 2. 🚛 Truck & Cubic Aggregate Calculator
* **CBM & CU.FT Bed Volume**: Calculate truck dump bed volume in Cubic Meters ($m^3$) and Cubic Feet ($ft^3$) using length, width, and depth parameters in Meters, Feet, Inches, or Centimeters.
* **Sand & Gravel Pricing**: Estimate total material cost for aggregates (Sand, Gravel, Wash Sand, Crushed Stone) based on volume or per-truck load rates.

### 3. 🔩 Hardware & Metric Specifications Guide
* **Wire Specifications**: Electrical wire gauge cross-reference table (AWG sizes vs $mm^2$ cross-sectional area, allowable ampacity ratings, and standard conduit sizes).
* **Bolt & Screw Specifications**: Diameter, pitch specs, length conversions, and matching socket/wrench size guide.
* **PVC Pipe & Conduit Specs**: Standard nominal pipe sizes (NPS) to Outer Diameter (OD) and wall thickness conversions.

### 4. 🧾 VAT & BIR Form 2307 Tax Calculators
* **12% VAT Breakdown**: Instantly extract VAT Exclusive base amount and 12% Value Added Tax from a VAT Inclusive sales invoice total.
* **BIR Form 2307 (Withholding Tax)**: Calculate Creditable Income Tax Withheld at source (EWT rates: 1%, 2%, 5%, 10%, 15%).

### 5. 💵 Finance & Cash Breakdown Calculator
* **Ordinary Calculator**: Standard desktop/mobile keypad layout featuring explicit arithmetic evaluation (`=`), all-clear (`AC`), and backspace (`⌫`).
* **Optimal PHP Cash Breakdown**: Instantly divides any Peso amount into exact Philippine banknote (₱1000, ₱500, ₱200, ₱100, ₱50, ₱20) and coin (₱10, ₱5, ₱1, ₱0.25) denomination distributions.
* **Popup Report & Custom Strategies**:
  * **Fewest Bills Mode**: Greedy algorithm minimizing physical volume of bills.
  * **Smaller Bills (Change) Mode**: Distributes totals into smaller denominations for cashier change floats.
  * **Pop Up Modal**: View detailed summary reports, disable specific denominations, or toggle zero-count display.

### 6. 📜 Shared History & Utilities
* **Activity Logs**: Save calculated results with direct timestamps to a persistent shared history log.
* **Filter & Search**: Filter saved calculations by category (VAT, 2307, Lumber, Conversions, Truck/Cubic, Cash Breakdown).
* **Dark / Light Theme**: Eye-friendly day/night mode toggles for outdoor site conditions or night shift cashier operations.

---

## 🚀 Tech Stack

* **Frontend Framework**: [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
* **Build System**: [Vite](https://vitejs.dev/)
* **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
* **Animations**: [Motion](https://motion.dev/)
* **Icons**: [Lucide React](https://lucide.react.dev/)

---

## 💻 Local Development Setup

### Prerequisites
* [Node.js](https://nodejs.org/) (v18 or higher)
* `npm` package manager

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/hardware-cash-calculator.git
   cd hardware-cash-calculator
