<div align="center">

  <img src="./public/icon.png" alt="Shopore logo" width="82" />

  # SHOPORE

  ### A modern, full-stack shopping experience

  Browse, discover, save and shop across fashion, beauty, home and lifestyle—all through a responsive storefront built for desktop and mobile.

  <br />

  <img src="https://img.shields.io/badge/Next.js-16-071225?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/React-19-149ECA?style=for-the-badge&logo=react&logoColor=white" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/ASP.NET_Core-.NET_10-512BD4?style=for-the-badge&logo=dotnet&logoColor=white" alt="ASP.NET Core" />
  <img src="https://img.shields.io/badge/SQL_Server-Shopore__DB-CC2927?style=for-the-badge&logo=microsoftsqlserver&logoColor=white" alt="SQL Server" />

  <br /><br />

  **Responsive storefront · Product discovery · Wishlist · Cart · Secure checkout · Orders · Reviews · Customer support**

</div>

---

## 🎬 Full Project Walkthrough

<p align="center">
  <a href="./public/recshopore.mp4">
    <img src="./public/landing.png" alt="Watch the complete Shopore project walkthrough" width="100%" />
  </a>
</p>

<p align="center">
  <a href="./public/recshopore.mp4"><b>▶ Watch the complete Shopore demo</b></a>
  <br />
  <sub>Responsive storefront · Product discovery · Cart · Checkout · Account · Orders · Support</sub>
</p>

---

## 📸 Product Preview

<p align="center">
  A visual walkthrough of the complete Shopore customer journey—from discovery to checkout and after-sales support.
</p>

<table>
  <tr>
    <td colspan="2" align="center">
      <img src="./public/landing.png" alt="Shopore landing page" width="100%" />
      <br />
      <sub><b>01 · Landing Experience</b> — Campaign-led discovery with a clean, premium storefront</sub>
    </td>
  </tr>
  <tr>
    <td width="50%" align="center">
      <img src="./public/section1.png" alt="Deal of the Day section" width="100%" />
      <br />
      <sub><b>02 · Deal of the Day</b></sub>
    </td>
    <td width="50%" align="center">
      <img src="./public/section2.png" alt="New Arrivals section" width="100%" />
      <br />
      <sub><b>03 · New Arrivals</b></sub>
    </td>
  </tr>
  <tr>
    <td width="50%" align="center">
      <img src="./public/product%20page.png" alt="Product details page" width="100%" />
      <br />
      <sub><b>04 · Product Details</b> — Size, price, delivery and bag actions</sub>
    </td>
    <td width="50%" align="center">
      <img src="./public/review.png" alt="Ratings and reviews" width="100%" />
      <br />
      <sub><b>05 · Ratings &amp; Reviews</b> — Verified customer feedback</sub>
    </td>
  </tr>
  <tr>
    <td colspan="2" align="center">
      <img src="./public/collection.png" alt="Shopore collection page" width="100%" />
      <br />
      <sub><b>06 · Curated Collections</b> — Responsive product discovery across every department</sub>
    </td>
  </tr>
  <tr>
    <td width="50%" align="center">
      <img src="./public/myorder.png" alt="My Orders page" width="100%" />
      <br />
      <sub><b>07 · My Orders</b> — Purchase history and delivery updates</sub>
    </td>
    <td width="50%" align="center">
      <img src="./public/help%26suppport.png" alt="Help and Support page" width="100%" />
      <br />
      <sub><b>08 · Help &amp; Support</b> — Guided support for every shopping concern</sub>
    </td>
  </tr>
  <tr>
    <td width="50%" align="center">
      <img src="./public/Orderdeatils.png" alt="Order details page" width="100%" />
      <br />
      <sub><b>09 · Order Details</b> — Payment, address and tracking information</sub>
    </td>
    <td width="50%" align="center">
      <img src="./public/contact.png" alt="Contact Shopore page" width="100%" />
      <br />
      <sub><b>10 · Contact</b> — A focused route to customer assistance</sub>
    </td>
  </tr>
  <tr>
    <td colspan="2" align="center">
      <img src="./public/footer.png" alt="Shopore footer" width="100%" />
      <br />
      <sub><b>11 · Complete Shopping Shell</b> — Navigation, policies, newsletter and support links</sub>
    </td>
  </tr>
</table>

---

## ✨ What makes Shopore different?

| Experience | Highlights |
|---|---|
| **Discover** | Multi-department catalog, campaign sections, search, filters and sorting |
| **Decide** | Product details, size selection, delivery check and verified reviews |
| **Shop** | Persistent cart, wishlist, saved addresses, COD, Razorpay and Google Pay flows |
| **Track** | Account dashboard, order history, delivery status, cancellation and returns |
| **Get help** | Contextual FAQs, support topics, contact form, notifications and shopping assistant |
| **Use anywhere** | Purpose-built responsive layouts for desktop, tablet and mobile |

## 🧱 Architecture

```text
Customer Browser
      │
      ▼
Next.js 16 Storefront  ──────►  ASP.NET Core Web API  ──────►  SQL Server
React 19 + TypeScript           EF Core + Swagger              Shopore_DB
```

## 🚀 Run locally

```bash
# Frontend
npm install
npm run dev
```

```powershell
# Backend
dotnet run --project .\Shoporestore_Backend\Shoporestore.Api\Shoporestore.Api.csproj --urls http://localhost:5285
```

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:5285
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_test_key
```

<div align="center">

  ---

  Built with care for a shopping experience that feels **clear, responsive and complete**.

  **SHOPORE © 2026**

</div>
