export function JsonLd() {
  const schemaData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": "https://riteshprajapati.com.np/#person",
        "name": "Ritesh Prajapati",
        "alternateName": [
          "Ritesh",
          "Ritesh Prajapati Cybersecurity",
          "Ritesh Prajapati Pentester",
          "panditritesh005",
        ],
        "url": "https://riteshprajapati.com.np",
        "image": "https://riteshprajapati.com.np/images/profile.png",
        "jobTitle": "Cybersecurity Specialist & Penetration Tester",
        "description":
          "Cybersecurity professional specializing in Penetration Testing, Bug Hunting, Intrusion Detection Systems (IDS/IPS), and Secure Systems Architecture. Dedicated to hardening digital perimeters and identifying critical vulnerabilities.",
        "email": "mailto:panditritesh005@gmail.com",
        "nationality": {
          "@type": "Country",
          "name": "Nepal",
        },
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Kathmandu",
          "addressCountry": "Nepal",
        },
        "sameAs": [
          "https://www.linkedin.com/in/ritesh-prajapati-5b7238285",
          "https://github.com/RiteshPrajapati369",
          "https://x.com/RiteshPraj8063",
        ],
        "knowsAbout": [
          "Cybersecurity",
          "Penetration Testing",
          "Bug Hunting",
          "Vulnerability Assessment",
          "Intrusion Detection Systems (IDS/IPS)",
          "Snort",
          "Suricata",
          "Network Security",
          "Web Application Security",
          "Secure Systems Architecture",
          "Multi-Factor Authentication (MFA)",
        ],
      },
      {
        "@type": "WebSite",
        "@id": "https://riteshprajapati.com.np/#website",
        "url": "https://riteshprajapati.com.np",
        "name": "Ritesh Prajapati | Cybersecurity Specialist",
        "alternateName": "Ritesh Prajapati Portfolio",
        "description":
          "Official cybersecurity portfolio and technical research notes of Ritesh Prajapati.",
        "inLanguage": "en-US",
        "publisher": {
          "@id": "https://riteshprajapati.com.np/#person",
        },
      },
      {
        "@type": "ProfilePage",
        "@id": "https://riteshprajapati.com.np/#profilepage",
        "url": "https://riteshprajapati.com.np",
        "name": "Ritesh Prajapati - Cybersecurity Portfolio",
        "isPartOf": {
          "@id": "https://riteshprajapati.com.np/#website",
        },
        "mainEntity": {
          "@id": "https://riteshprajapati.com.np/#person",
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
}
