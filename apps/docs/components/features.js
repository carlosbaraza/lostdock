import { useRouter } from "next/router";
import { FaDocker, FaHeart, FaDollarSign, FaThumbsUp } from "react-icons/fa";
import { BsFillCloudArrowUpFill } from "react-icons/bs";

import styles from "./features.module.css";

const Feature = ({ text, icon }) => (
  <div className={styles.feature}>
    {icon}
    <h4>{text}</h4>
  </div>
);

const TITLE_WITH_TRANSLATIONS = {
  "en-US": "Cheap deployment to a VPS with Docker Compose",
};

// Translations for Features
const FEATURES_WITH_TRANSLATIONS = {
  "en-US": {
    lightweight: "Lightweight",
    cheap: "Cheap",
    reliable: "Reliable",
    scalable: "Scalable",
    generic: "Deploy any app",
    simple: "Easy to use",
    fast: "Fast deployment",
    docker: "Docker Compose",
  },
};

export default () => {
  const { locale, defaultLocale } = useRouter();

  const featureText = (key) =>
    FEATURES_WITH_TRANSLATIONS[locale]?.[key] ??
    FEATURES_WITH_TRANSLATIONS[defaultLocale][key]; // Fallback for missing translations

  return (
    <div className="mx-auto mb-10 w-[880px] max-w-full px-4 text-center mt-12">
      <p className="mb-2 text-lg text-gray-600 md:!text-2xl">
        {TITLE_WITH_TRANSLATIONS[locale]}
      </p>
      <div className={styles.features}>
        <Feature
          text={featureText("cheap")}
          icon={<FaDollarSign className="h-6 w-6" />}
        />
        <Feature
          text={featureText("simple")}
          icon={<FaHeart className="h-6 w-6" />}
        />
        <Feature
          text={featureText("generic")}
          icon={
            <svg
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              shapeRendering="geometricPrecision"
              viewBox="0 0 24 24"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
          }
        />
        <Feature
          text={featureText("fast")}
          icon={
            <svg
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              shapeRendering="geometricPrecision"
              viewBox="0 0 24 24"
            >
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
            </svg>
          }
        />
        <Feature
          text={featureText("scalable")}
          icon={<BsFillCloudArrowUpFill className="h-6 w-6" />}
        />
        <Feature
          text={featureText("reliable")}
          icon={<FaThumbsUp className="h-6 w-6" />}
        />
        <Feature
          text={featureText("docker")}
          icon={<FaDocker className="h-6 w-6" />}
        />
        <Feature
          text={featureText("lightweight")}
          icon={
            <svg
              viewBox="0 0 24 24"
              width="24"
              height="24"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"></path>
              <line x1="16" y1="8" x2="2" y2="22"></line>
              <line x1="17.5" y1="15" x2="9" y2="15"></line>
            </svg>
          }
        />
      </div>
    </div>
  );
};
