// In-memory cache
let cache = {
  data: null,
  timestamp: 0,
  TTL: 60 * 60 * 1000, // 1 hour
};

// Fallback static data in case the API is unreachable
const FALLBACK_COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda",
  "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain",
  "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan",
  "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria",
  "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada",
  "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros",
  "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic",
  "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt",
  "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia",
  "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana",
  "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti",
  "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland",
  "Israel", "Italy", "Ivory Coast", "Jamaica", "Japan", "Jordan", "Kazakhstan",
  "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon",
  "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg",
  "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands",
  "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia",
  "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal",
  "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea",
  "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama",
  "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal",
  "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia",
  "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe",
  "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore",
  "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea",
  "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland",
  "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo",
  "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu",
  "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States",
  "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam",
  "Yemen", "Zambia", "Zimbabwe"
];

const FALLBACK_NATIONALITIES = [
  "Afghan", "Albanian", "Algerian", "American", "Andorran", "Angolan", "Argentine",
  "Armenian", "Australian", "Austrian", "Azerbaijani", "Bahamian", "Bahraini",
  "Bangladeshi", "Barbadian", "Belarusian", "Belgian", "Belizean", "Beninese",
  "Bhutanese", "Bolivian", "Bosnian", "Brazilian", "British", "Bruneian", "Bulgarian",
  "Burkinabe", "Burmese", "Burundian", "Cambodian", "Cameroonian", "Canadian",
  "Cape Verdean", "Central African", "Chadian", "Chilean", "Chinese", "Colombian",
  "Comoran", "Congolese", "Costa Rican", "Croatian", "Cuban", "Cypriot", "Czech",
  "Danish", "Djiboutian", "Dominican", "Dutch", "Ecuadorian", "Egyptian",
  "Emirati", "English", "Equatorial Guinean", "Eritrean", "Estonian", "Ethiopian",
  "Fijian", "Finnish", "French", "Gabonese", "Gambian", "Georgian", "German",
  "Ghanaian", "Greek", "Grenadian", "Guatemalan", "Guinean", "Guyanese", "Haitian",
  "Honduran", "Hungarian", "Icelandic", "Indian", "Indonesian", "Iranian", "Iraqi",
  "Irish", "Israeli", "Italian", "Ivorian", "Jamaican", "Japanese", "Jordanian",
  "Kazakh", "Kenyan", "Kiribati", "Korean", "Kuwaiti", "Kyrgyz", "Laotian", "Latvian",
  "Lebanese", "Liberian", "Libyan", "Liechtensteiner", "Lithuanian", "Luxembourger",
  "Malagasy", "Malawian", "Malaysian", "Maldivian", "Malian", "Maltese", "Marshallese",
  "Mauritanian", "Mauritian", "Mexican", "Micronesian", "Moldovan", "Monegasque",
  "Mongolian", "Montenegrin", "Moroccan", "Mozambican", "Namibian", "Nauruan",
  "Nepalese", "New Zealand", "Nicaraguan", "Nigerian", "Nigerien", "North Korean",
  "North Macedonian", "Norwegian", "Omani", "Pakistani", "Palauan", "Palestinian",
  "Panamanian", "Papua New Guinean", "Paraguayan", "Peruvian", "Philippine",
  "Polish", "Portuguese", "Qatari", "Romanian", "Russian", "Rwandan",
  "Saint Lucian", "Salvadoran", "Samoan", "San Marinese", "Sao Tomean", "Saudi",
  "Scottish", "Senegalese", "Serbian", "Seychellois", "Sierra Leonean", "Singaporean",
  "Slovak", "Slovenian", "Solomon Islander", "Somali", "South African", "South Sudanese",
  "Spanish", "Sri Lankan", "Sudanese", "Surinamese", "Swazi", "Swedish", "Swiss",
  "Syrian", "Taiwanese", "Tajik", "Tanzanian", "Thai", "Togolese", "Tongan",
  "Trinidadian", "Tunisian", "Turkish", "Turkmen", "Tuvaluan", "Ugandan", "Ukrainian",
  "Uruguayan", "Uzbek", "Vanuatuan", "Vatican", "Venezuelan", "Vietnamese",
  "Welsh", "Yemeni", "Zambian", "Zimbabwean"
];

exports.getCountriesAndNationalities = async (req, res) => {
  try {
    // Return cached data if still valid
    if (cache.data && Date.now() - cache.timestamp < cache.TTL) {
      return res.json(cache.data);
    }

    // Try to fetch from the free REST Countries API (no API key required)
    try {
      const response = await fetch("https://restcountries.com/v3.1/all?fields=name,demonyms");

      if (response.ok) {
        const records = await response.json();

        const countries = records
          .map((country) => country.name?.common)
          .filter(Boolean)
          .sort((a, b) => a.localeCompare(b));

        const nationalities = [
          ...new Set(
            records
              .map(
                (country) =>
                  country.demonyms?.eng?.m ||
                  country.demonyms?.eng?.f ||
                  country.name?.common,
              )
              .filter(Boolean),
          ),
        ].sort((a, b) => a.localeCompare(b));

        const responseData = { countries, nationalities };

        // Update cache
        cache = {
          data: responseData,
          timestamp: Date.now(),
          TTL: 60 * 60 * 1000,
        };

        return res.json(responseData);
      }
    } catch (apiError) {
      console.error("REST Countries API error:", apiError.message);
    }

    // If API failed, use fallback static data
    console.log("Using fallback country data");
    const responseData = {
      countries: FALLBACK_COUNTRIES,
      nationalities: FALLBACK_NATIONALITIES,
    };

    // Update cache with fallback data (shorter TTL so it retries the API sooner)
    cache = {
      data: responseData,
      timestamp: Date.now(),
      TTL: 30 * 60 * 1000, // 30 minutes
    };

    res.json(responseData);
  } catch (error) {
    console.error("Country reference error:", error.message);

    // If we have stale cache data, return it as fallback
    if (cache.data) {
      console.log("Returning cached country data as fallback");
      return res.json(cache.data);
    }

    // Last resort: return static fallback
    res.json({
      countries: FALLBACK_COUNTRIES,
      nationalities: FALLBACK_NATIONALITIES,
    });
  }
};
