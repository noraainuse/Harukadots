const WEBSTORE_LINK = `https://chromewebstore.google.com/detail/${chrome.runtime.id}`;

const UPDATE_POPUP_RESTRICTION_KEY = "updatePopupRestriction";
const UPDATE_POPUP_DO_NOT_SHOW_KEY = "updatePopupDoNotShow";
const CONFIGURABLE_POPUP_RESTRICTION_KEY = "configurablePopupRestriction";
const CONFIGURABLE_POPUP_DO_NOT_SHOW_KEY = "configurablePopupDoNotShow";
const ANTI_ADBLOCK_POPUP_RESTRICTION_KEY = "antiAdblockPopupRestriction";
const ANTI_ADBLOCK_POPUP_DO_NOT_SHOW_KEY = "antiAdblockPopupDoNotShow";
const OTHER_STREAMING_RESTRICTION_KEY = "otherStreamingPopupRestriction";
const OTHER_STREAMING_POPUP_DO_NOT_SHOW_KEY = "otherStreamingPopupDoNotShow";
const POPUP_GENERAL_RESTRICTION_KEY = "popupGeneralRestriction";
const RATING_POPUP_RESTRICTION_KEY = "ratingDialogShown";

const IS_ADDITIONAL_BLOCKING_ENABLED = "isAdditionalBlockingEnabled";

const INSTALLED_AT_KEY = "installedAt";

const MIN_USER_LIVE_FOR_POPUP = 1000 * 60 * 60 * 24 * 3; // 3 days
const GENERAL_POPUPS_RESTRICTION_TIME = 1000 * 60 * 60 * 24; // 1 day
const ANTI_ADBLOCK_POPUP_RESTRICTION_TIME = 1000 * 60 * 60 * 24; // 1 day
const OTHER_STREAMING_RESTRICTION_TIME = 1000 * 60 * 60 * 24; // 1 day

const commonStyles = `
  box-sizing: border-box;
  background: #FFF;
  z-index: 99999999999;
  position: fixed;
  right: 23px;
  top: 68px;
  box-shadow: 0px 4px 17px 0px rgba(0, 0, 0, 0.25);
  border-radius: 3px;
`;

const fontCss = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600&family=Poppins:wght@500&display=swap');
`;

const popupSvg = `
  <svg width="184" height="158" viewBox="0 0 184 158" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g filter="url(#filter0_d_726_1058)">
    <g clip-path="url(#clip0_726_1058)">
    <rect x="17" y="22" width="120.105" height="114.94" rx="5.81154" fill="#FDFFFD"/>
    <rect width="120.105" height="12.9146" transform="translate(17 22.0096)" fill="#D61717"/>
    <circle cx="26.0417" cy="28.4668" r="1.93718" fill="#FDFFFD"/>
    <circle cx="33.7902" cy="28.4668" r="1.93718" fill="#D61717"/>
    <circle cx="41.5392" cy="28.4668" r="1.93718" fill="#FDFFFD"/>
    <rect x="24.1045" y="69.9996" width="105.254" height="7.74873" rx="1.93718" fill="#D61717" fill-opacity="0.12"/>
    <rect x="24" y="83" width="106" height="44" rx="1.93718" fill="#D61717" fill-opacity="0.12"/>
    <path d="M49.0422 47.6844C48.7593 46.6272 47.9284 45.7964 46.8712 45.5134C44.9571 45 37.2778 45 37.2778 45C37.2778 45 29.5986 45 27.6844 45.5134C26.6272 45.7964 25.7964 46.6272 25.5134 47.6844C25 49.5986 25 53.5949 25 53.5949C25 53.5949 25 57.5912 25.5134 59.5054C25.7964 60.5626 26.6272 61.3934 27.6844 61.6763C29.5986 62.1898 37.2778 62.1898 37.2778 62.1898C37.2778 62.1898 44.9571 62.1898 46.8712 61.6763C47.9284 61.3934 48.7593 60.5626 49.0422 59.5054C49.5557 57.5912 49.5557 53.5949 49.5557 53.5949C49.5557 53.5949 49.5536 49.5986 49.0422 47.6844Z" fill="#FF0000"/>
    <path d="M34.8198 57.2782L41.1993 53.5953L34.8198 49.9123V57.2782Z" fill="white"/>
    <path d="M54.7406 56.1764L51.9834 46.2191H54.3888L55.3551 50.7328C55.6017 51.8446 55.7816 52.7926 55.8988 53.5769H55.9695C56.0504 53.0149 56.2324 52.073 56.5133 50.749L57.5139 46.2191H59.9193L57.1278 56.1764V60.9529H54.7386V56.1764H54.7406Z" fill="#282828"/>
    <path d="M60.643 60.6372C60.1579 60.3098 59.8122 59.8003 59.606 59.109C59.4019 58.4178 59.2988 57.5001 59.2988 56.3519V54.7893C59.2988 53.6311 59.4161 52.6993 59.6505 51.9979C59.885 51.2965 60.2509 50.783 60.7481 50.4616C61.2454 50.1402 61.8983 49.9785 62.7069 49.9785C63.5033 49.9785 64.14 50.1422 64.621 50.4697C65.1001 50.7972 65.4518 51.3106 65.6742 52.006C65.8965 52.7033 66.0077 53.6311 66.0077 54.7893V56.3519C66.0077 57.5001 65.8986 58.4218 65.6823 59.1171C65.466 59.8145 65.1143 60.3239 64.6291 60.6453C64.144 60.9667 63.4851 61.1284 62.6543 61.1284C61.7972 61.1304 61.1282 60.9647 60.643 60.6372ZM63.3638 58.9514C63.4972 58.5997 63.5659 58.0276 63.5659 57.2312V53.8778C63.5659 53.1056 63.4992 52.5396 63.3638 52.1838C63.2283 51.8261 62.9919 51.6482 62.6522 51.6482C62.3248 51.6482 62.0923 51.8261 61.9589 52.1838C61.8235 52.5416 61.7568 53.1056 61.7568 53.8778V57.2312C61.7568 58.0276 61.8214 58.6017 61.9509 58.9514C62.0802 59.3031 62.3126 59.479 62.6522 59.479C62.9919 59.479 63.2283 59.3031 63.3638 58.9514Z" fill="#282828"/>
    <path d="M73.8326 60.955H71.9365L71.7263 59.637H71.6738C71.1583 60.6316 70.3861 61.1288 69.3552 61.1288C68.6417 61.1288 68.1141 60.8943 67.7746 60.4274C67.435 59.9584 67.2651 59.2267 67.2651 58.2322V50.1891H69.6888V58.0906C69.6888 58.5718 69.7413 58.9133 69.8464 59.1176C69.9516 59.3217 70.1274 59.4247 70.374 59.4247C70.5842 59.4247 70.7864 59.3601 70.9804 59.2308C71.1745 59.1013 71.316 58.9376 71.411 58.7396V50.1871H73.8326V60.955Z" fill="#282828"/>
    <path d="M80.4159 48.1694H78.0104V60.9545H75.6393V48.1694H73.2339V46.2208H80.4159V48.1694Z" fill="#282828"/>
    <path d="M86.2618 60.955H84.3657L84.1555 59.637H84.103C83.5876 60.6316 82.8154 61.1288 81.7844 61.1288C81.0709 61.1288 80.5433 60.8943 80.2038 60.4274C79.8642 59.9584 79.6943 59.2267 79.6943 58.2322V50.1891H82.118V58.0906C82.118 58.5718 82.1705 58.9133 82.2756 59.1176C82.3808 59.3217 82.5566 59.4247 82.8033 59.4247C83.0134 59.4247 83.2156 59.3601 83.4096 59.2308C83.6037 59.1013 83.7452 58.9376 83.8402 58.7396V50.1871H86.2618V60.955Z" fill="#282828"/>
    <path d="M94.2825 51.9091C94.1349 51.2299 93.8984 50.7387 93.571 50.4335C93.2435 50.1283 92.7927 49.9767 92.2187 49.9767C91.774 49.9767 91.3576 50.102 90.9715 50.3547C90.5854 50.6073 90.2862 50.9368 90.076 51.3471H90.0579V45.6752H87.7231V60.9527H89.7243L89.9709 59.934H90.0235C90.2114 60.2978 90.4924 60.5828 90.8664 60.7951C91.2403 61.0053 91.6568 61.1104 92.1136 61.1104C92.9322 61.1104 93.5366 60.7324 93.9227 59.9784C94.3088 59.2224 94.5028 58.0439 94.5028 56.439V54.735C94.5028 53.5322 94.428 52.5883 94.2825 51.9091ZM92.061 56.3015C92.061 57.0858 92.0287 57.7003 91.9639 58.145C91.8993 58.5897 91.7921 58.9071 91.6385 59.093C91.4869 59.281 91.2807 59.374 91.024 59.374C90.8239 59.374 90.64 59.3275 90.4702 59.2325C90.3004 59.1395 90.163 58.9981 90.0579 58.8121V52.7015C90.1387 52.4084 90.2802 52.1698 90.4803 51.9819C90.6784 51.7939 90.8967 51.7009 91.1291 51.7009C91.3758 51.7009 91.5657 51.7979 91.6992 51.9899C91.8346 52.184 91.9276 52.5074 91.9802 52.9642C92.0327 53.4211 92.059 54.0699 92.059 54.9128V56.3015H92.061Z" fill="#282828"/>
    <path d="M97.9413 56.9221C97.9413 57.6134 97.9615 58.1309 98.002 58.4766C98.0424 58.8222 98.1273 59.0729 98.2566 59.2326C98.386 59.3902 98.5841 59.469 98.8529 59.469C99.2148 59.469 99.4654 59.3275 99.5988 59.0466C99.7343 58.7656 99.807 58.2967 99.8192 57.6417L101.909 57.765C101.921 57.858 101.927 57.9873 101.927 58.1511C101.927 59.1456 101.655 59.8895 101.111 60.3807C100.567 60.8719 99.7969 61.1185 98.8024 61.1185C97.6078 61.1185 96.7709 60.7445 96.2918 59.9946C95.8108 59.2447 95.5723 58.0864 95.5723 56.5178V54.6379C95.5723 53.0229 95.8209 51.8424 96.3181 51.0985C96.8154 50.3547 97.6664 49.9827 98.8731 49.9827C99.7039 49.9827 100.343 50.1343 100.787 50.4396C101.232 50.7448 101.545 51.2178 101.727 51.8626C101.909 52.5074 102 53.3968 102 54.5328V56.3763H97.9413V56.9221ZM98.2485 51.8485C98.1252 52.0001 98.0444 52.2487 98.002 52.5943C97.9615 52.94 97.9413 53.4635 97.9413 54.167V54.9392H99.7141V54.167C99.7141 53.4757 99.6898 52.9521 99.6433 52.5943C99.5968 52.2366 99.5119 51.9859 99.3886 51.8384C99.2653 51.6928 99.0753 51.618 98.8186 51.618C98.5598 51.62 98.3698 51.6969 98.2485 51.8485Z" fill="#282828"/>
    </g>
    </g>
    <g filter="url(#filter1_d_726_1058)">
    <g clip-path="url(#clip1_726_1058)">
    <rect x="106" y="13" width="60.8642" height="88.9554" rx="4.21367" fill="#FDFFFD"/>
    <rect width="60.8642" height="9.36373" transform="translate(106.001 12.9994)" fill="#D61717"/>
    <ellipse cx="112.554" cy="17.6833" rx="1.40456" ry="1.40456" fill="#FDFFFD"/>
    <ellipse cx="118.172" cy="17.6832" rx="1.40456" ry="1.40456" fill="#D61717"/>
    <ellipse cx="123.79" cy="17.6832" rx="1.40456" ry="1.40456" fill="#FDFFFD"/>
    <rect x="112.555" y="26.108" width="47.755" height="5.61823" rx="1.40456" fill="#D61717" fill-opacity="0.12"/>
    <rect x="112.555" y="35.4743" width="47.755" height="61.8006" rx="1.40456" fill="#D61717" fill-opacity="0.12"/>
    <path d="M122.388 79.7807L128 67.6078H130.878L136.509 79.7807H133.451L128.846 69.0338H129.997L125.374 79.7807H122.388ZM125.194 77.1722L125.967 75.0332H132.443L133.235 77.1722H125.194Z" fill="#D61717"/>
    <path d="M137.815 79.7807V67.6078H143.535C144.902 67.6078 146.108 67.8629 147.151 68.373C148.194 68.8715 149.01 69.5729 149.597 70.4771C150.185 71.3814 150.479 72.4538 150.479 73.6942C150.479 74.9231 150.185 75.9955 149.597 76.9113C149.01 77.8156 148.194 78.5228 147.151 79.0329C146.108 79.5314 144.902 79.7807 143.535 79.7807H137.815ZM140.729 77.4678H143.391C144.231 77.4678 144.956 77.3171 145.568 77.0157C146.192 76.7027 146.671 76.2621 147.007 75.6941C147.355 75.126 147.529 74.4594 147.529 73.6942C147.529 72.9175 147.355 72.2509 147.007 71.6944C146.671 71.1263 146.192 70.6916 145.568 70.3902C144.956 70.0772 144.231 69.9207 143.391 69.9207H140.729V77.4678Z" fill="#D61717"/>
    <path d="M122.388 89.0512V83.6192H125.055C125.742 83.6192 126.256 83.7485 126.6 84.0072C126.948 84.2658 127.122 84.6073 127.122 85.0315C127.122 85.316 127.052 85.5644 126.911 85.7765C126.771 85.9834 126.579 86.1438 126.334 86.2576C126.09 86.3714 125.809 86.4283 125.492 86.4283L125.64 86.1101C125.983 86.1101 126.288 86.167 126.553 86.2809C126.818 86.3895 127.023 86.5525 127.169 86.7697C127.32 86.987 127.395 87.2534 127.395 87.569C127.395 88.0346 127.21 88.3993 126.841 88.6632C126.472 88.9218 125.929 89.0512 125.211 89.0512H122.388ZM123.643 88.1045H125.118C125.445 88.1045 125.692 88.0527 125.859 87.9493C126.03 87.8406 126.116 87.6699 126.116 87.4371C126.116 87.2095 126.03 87.0413 125.859 86.9327C125.692 86.8189 125.445 86.762 125.118 86.762H123.55V85.8463H124.899C125.206 85.8463 125.44 85.7946 125.601 85.6911C125.768 85.5825 125.851 85.4195 125.851 85.2022C125.851 84.9901 125.768 84.8323 125.601 84.7289C125.44 84.6202 125.206 84.5659 124.899 84.5659H123.643V88.1045Z" fill="#D61717"/>
    <path d="M128.352 89.0512V83.6192H129.615V88.0269H132.353V89.0512H128.352Z" fill="#D61717"/>
    <path d="M135.619 89.1443C135.188 89.1443 134.787 89.0745 134.418 88.9348C134.054 88.7951 133.737 88.5985 133.467 88.345C133.201 88.0915 132.993 87.7941 132.843 87.4526C132.697 87.1112 132.624 86.7387 132.624 86.3352C132.624 85.9317 132.697 85.5592 132.843 85.2177C132.993 84.8763 133.204 84.5788 133.474 84.3253C133.745 84.0718 134.062 83.8753 134.426 83.7356C134.79 83.5959 135.185 83.5261 135.612 83.5261C136.043 83.5261 136.438 83.5959 136.797 83.7356C137.161 83.8753 137.476 84.0718 137.741 84.3253C138.011 84.5788 138.222 84.8763 138.373 85.2177C138.523 85.554 138.599 85.9265 138.599 86.3352C138.599 86.7387 138.523 87.1138 138.373 87.4604C138.222 87.8018 138.011 88.0993 137.741 88.3528C137.476 88.6011 137.161 88.7951 136.797 88.9348C136.438 89.0745 136.046 89.1443 135.619 89.1443ZM135.612 88.0734C135.856 88.0734 136.08 88.032 136.282 87.9493C136.49 87.8665 136.672 87.7475 136.828 87.5923C136.984 87.4371 137.104 87.2534 137.187 87.0413C137.276 86.8292 137.32 86.5938 137.32 86.3352C137.32 86.0765 137.276 85.8411 137.187 85.629C137.104 85.4169 136.984 85.2333 136.828 85.0781C136.678 84.9229 136.498 84.8039 136.29 84.7211C136.082 84.6383 135.856 84.5969 135.612 84.5969C135.367 84.5969 135.141 84.6383 134.933 84.7211C134.73 84.8039 134.551 84.9229 134.395 85.0781C134.239 85.2333 134.117 85.4169 134.028 85.629C133.945 85.8411 133.903 86.0765 133.903 86.3352C133.903 86.5887 133.945 86.8241 134.028 87.0413C134.117 87.2534 134.236 87.4371 134.387 87.5923C134.543 87.7475 134.725 87.8665 134.933 87.9493C135.141 88.032 135.367 88.0734 135.612 88.0734Z" fill="#D61717"/>
    <path d="M142.161 89.1443C141.74 89.1443 141.348 89.077 140.984 88.9425C140.625 88.8029 140.313 88.6063 140.048 88.3528C139.782 88.0993 139.574 87.8018 139.424 87.4604C139.278 87.1189 139.205 86.7439 139.205 86.3352C139.205 85.9265 139.278 85.5514 139.424 85.21C139.574 84.8685 139.782 84.5711 140.048 84.3176C140.318 84.0641 140.633 83.8701 140.991 83.7356C141.35 83.5959 141.743 83.5261 142.169 83.5261C142.642 83.5261 143.069 83.6088 143.448 83.7744C143.833 83.9348 144.155 84.1727 144.415 84.4883L143.604 85.2333C143.417 85.0212 143.209 84.8634 142.98 84.7599C142.752 84.6513 142.502 84.5969 142.232 84.5969C141.977 84.5969 141.743 84.6383 141.53 84.7211C141.316 84.8039 141.132 84.9229 140.976 85.0781C140.82 85.2333 140.698 85.4169 140.609 85.629C140.526 85.8411 140.484 86.0765 140.484 86.3352C140.484 86.5938 140.526 86.8292 140.609 87.0413C140.698 87.2534 140.82 87.4371 140.976 87.5923C141.132 87.7475 141.316 87.8665 141.53 87.9493C141.743 88.032 141.977 88.0734 142.232 88.0734C142.502 88.0734 142.752 88.0217 142.98 87.9182C143.209 87.8096 143.417 87.6466 143.604 87.4293L144.415 88.1743C144.155 88.4899 143.833 88.7304 143.448 88.896C143.069 89.0615 142.64 89.1443 142.161 89.1443Z" fill="#D61717"/>
    <path d="M146.4 87.8096L146.329 86.3585L148.942 83.6192H150.346L147.991 86.1412L147.289 86.8861L146.4 87.8096ZM145.269 89.0512V83.6192H146.524V89.0512H145.269ZM149.005 89.0512L147.063 86.6844L147.889 85.792L150.479 89.0512H149.005Z" fill="#D61717"/>
    <rect x="118.641" y="41.6405" width="34.9996" height="17.0568" rx="8.52839" fill="#D61717"/>
    <rect x="120.855" y="43.4127" width="13.423" height="13.423" rx="6.71149" fill="white"/>
    <path d="M126.719 50.6749C126.719 51.0221 126.654 51.3195 126.524 51.567C126.395 51.8135 126.218 52.0023 125.995 52.1334C125.773 52.2645 125.52 52.33 125.238 52.33C124.956 52.33 124.703 52.2645 124.48 52.1334C124.258 52.0012 124.081 51.8119 123.951 51.5654C123.822 51.3179 123.758 51.0211 123.758 50.6749C123.758 50.3278 123.822 50.031 123.951 49.7845C124.081 49.5369 124.258 49.3476 124.48 49.2165C124.703 49.0854 124.956 49.0199 125.238 49.0199C125.52 49.0199 125.773 49.0854 125.995 49.2165C126.218 49.3476 126.395 49.5369 126.524 49.7845C126.654 50.031 126.719 50.3278 126.719 50.6749ZM126.132 50.6749C126.132 50.4306 126.094 50.2245 126.017 50.0567C125.942 49.8878 125.837 49.7604 125.702 49.6743C125.568 49.5873 125.413 49.5438 125.238 49.5438C125.063 49.5438 124.908 49.5873 124.774 49.6743C124.64 49.7604 124.535 49.8878 124.458 50.0567C124.382 50.2245 124.345 50.4306 124.345 50.6749C124.345 50.9193 124.382 51.126 124.458 51.2948C124.535 51.4626 124.64 51.5901 124.774 51.6771C124.908 51.7631 125.063 51.8061 125.238 51.8061C125.413 51.8061 125.568 51.7631 125.702 51.6771C125.837 51.5901 125.942 51.4626 126.017 51.2948C126.094 51.126 126.132 50.9193 126.132 50.6749ZM127.271 52.286V49.0639H129.335V49.5532H127.854V50.4279H129.193V50.9172H127.854V52.286H127.271ZM129.867 52.286V49.0639H131.931V49.5532H130.45V50.4279H131.789V50.9172H130.45V52.286H129.867Z" fill="#D61717"/>
    </g>
    </g>
    <defs>
    <filter id="filter0_d_726_1058" x="0" y="9" width="154.105" height="148.94" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
    <feFlood flood-opacity="0" result="BackgroundImageFix"/>
    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
    <feOffset dy="4"/>
    <feGaussianBlur stdDeviation="8.5"/>
    <feComposite in2="hardAlpha" operator="out"/>
    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_726_1058"/>
    <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_726_1058" result="shape"/>
    </filter>
    <filter id="filter1_d_726_1058" x="89" y="0" width="94.8643" height="122.955" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
    <feFlood flood-opacity="0" result="BackgroundImageFix"/>
    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
    <feOffset dy="4"/>
    <feGaussianBlur stdDeviation="8.5"/>
    <feComposite in2="hardAlpha" operator="out"/>
    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_726_1058"/>
    <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_726_1058" result="shape"/>
    </filter>
    <clipPath id="clip0_726_1058">
    <rect x="17" y="22" width="120.105" height="114.94" rx="5.81154" fill="white"/>
    </clipPath>
    <clipPath id="clip1_726_1058">
    <rect x="106" y="13" width="60.8642" height="88.9554" rx="4.21367" fill="white"/>
    </clipPath>
    </defs>
  </svg>
`;

const checkboxHtml = `
  <div class="checkbox">
    <input
      class="checkbox-input"
      type="checkbox"
      id="checkbox"
    />
    <label class="label" for='checkbox'>
      <span></span>
      Don’t show this message again
    </label>
  </div>
`;

// language=CSS
const checkboxCss = `
  .checkbox {
      display: flex;
      align-items: center;
      justify-content: center;
  }

  .checkbox-input {
      display: none;
  }

  .label {
      max-width: 250px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      gap: 6px;
      font-size: 12px;
      font-style: normal;
      font-weight: 400;
      line-height: 16px;
      text-align: left;
      color: #C4C4C4;
      transition: all 0.3s ease-in-out;
  }

  .label > span {
      content: "";
      position: relative;
      display: block;
      min-width: 10px;
      height: 10px;
      border: 1px solid #D4D4D4;
      border-radius: 2px;
      background: transparent;
      transition: all 0.3s ease-in-out;
  }

  .label:hover > span {
    border-color: #F97474;
  }

  .checkbox-input:checked + label:hover > span {
    background-color: #F97474;
    border-color: #F97474;
  }

  .checkbox-input:checked + label {
    color: #828282;
  }

  .checkbox-input:checked + label:hover {
      color: #C4C4C4;
  }

  .checkbox-input:checked + label > span {
      background: #828282;
      border: 1px solid #828282;
  }

  .checkbox-input:checked + label > span::after {
      content: "";
      position: absolute;
      left: 3px;
      top: 0;
      width: 3px;
      height: 7px;
      border: solid #fff;
      border-width: 0 1px 1px 0;
      -webkit-transform: rotate(45deg);
      -ms-transform: rotate(45deg);
      transform: rotate(45deg);
  }

  .label:hover {
      cursor: pointer;
  }
`;

const closeHtml = `
  <div class='close'>
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="25" viewBox="0 0 24 25" fill="none">
      <path d="M19 6.91L17.59 5.5L12 11.09L6.41 5.5L5 6.91L10.59 12.5L5 18.09L6.41 19.5L12 13.91L17.59 19.5L19 18.09L13.41 12.5L19 6.91Z" fill="#D9D9D9"/>
    </svg>
  </div>
`;

const headerHtml = `
  <div class="top-block">
    <div class='logo'>
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="29" viewBox="0 0 28 29" fill="none">
        <path d="M6.55379 1.84377C3.52404 2.05865 3.09428 2.20906 2.21329 3.5198C1.41825 4.68013 1.26784 5.99088 1.13891 12.6735C0.967012 22.4289 1.31081 24.9644 2.98685 26.3826C3.65296 26.9413 3.56701 26.9198 8.91742 27.3281C11.6678 27.5429 15.8364 27.5429 18.5868 27.3281C24.2166 26.8983 23.8298 26.9628 24.7323 26.1677C25.8926 25.1363 26.1505 24.062 26.4513 19.2702C26.8166 13.2322 26.3868 5.58261 25.5918 4.01402C24.9042 2.6603 24.2166 2.18757 22.7125 1.99418C20.4563 1.73633 9.49759 1.62889 6.55379 1.84377ZM20.9075 4.7446C21.9174 4.9165 22.8844 5.84047 23.2282 6.93633C23.5505 8.01071 23.7224 17.3363 23.4645 19.7644C23.2497 21.9347 22.7984 23.1165 21.9819 23.6322C21.1224 24.2124 14.934 24.5132 10.0992 24.2339C5.75875 23.9975 5.39346 23.8686 4.66288 22.4074C4.03974 21.1611 3.71742 15.2091 4.03974 10.7396C4.40503 5.41071 4.77032 4.89501 8.29428 4.61567C10.572 4.42228 19.5538 4.52972 20.9075 4.7446Z" fill="#D61717"/>
        <path d="M7.7356 14.2851V21.0537L10.9158 17.8735C12.6563 16.133 14.1604 14.7149 14.2463 14.7149C14.3323 14.7149 14.3968 16.133 14.3968 17.8735V21.0537L17.7703 17.6587L21.1653 14.2851L17.7703 10.9116L14.3968 7.51652V10.6967C14.3968 12.4372 14.3323 13.8554 14.2463 13.8554C14.1604 13.8554 12.6563 12.4372 10.9158 10.6967L7.7356 7.51652V14.2851Z" fill="#D61717"/>
      </svg>
      <span>Adblock for YouTube™</span>
    </div>
    ${closeHtml}
  </div>
`;

// language=CSS
const headerCss = `
    .top-block {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background-color: #FCFCFC;
        border-bottom: 1px solid #BDBDBD;
        padding: 16px;
        margin: -16px -16px 16px -16px;
        color: #313131;
        font-variant-numeric: lining-nums proportional-nums;
        font-family: 'Poppins', sans-serif;
        font-size: 12px;
        font-style: normal;
        font-weight: 500;
        line-height: 12.694px;
    }
    
    .logo {
        display: flex;
        gap: 10px;
        align-items: center;
    }

    .close {
        cursor: pointer;
    }
`;

const antiAdblockDetectedHtml = `
  <div class='aby-popup'>
    ${headerHtml}
    <div class="detected">
      ${popupSvg}
      <p>We’ve detected that a YouTube ad block warning could have appeared for you:</p>
    </div>
    <div class='info'>
      <div>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="25" viewBox="0 0 24 25" fill="none">
          <path d="M11 7.93951H13V9.93951H11V7.93951ZM11 11.9395H13V17.9395H11V11.9395ZM12 2.93951C6.48 2.93951 2 7.41951 2 12.9395C2 18.4595 6.48 22.9395 12 22.9395C17.52 22.9395 22 18.4595 22 12.9395C22 7.41951 17.52 2.93951 12 2.93951ZM12 20.9395C7.59 20.9395 4 17.3495 4 12.9395C4 8.52951 7.59 4.93951 12 4.93951C16.41 4.93951 20 8.52951 20 12.9395C20 17.3495 16.41 20.9395 12 20.9395Z" fill="#D61717"/>
        </svg>
      </div>
      <p>Adblock for Youtube does not cause such warnings because of a different approach of skipping ads</p>
    </div>
    <p class="disable">To fix this, please <span>disable all other ad blockers</span> besides Adblock for Youtube and reload the page</p>
    <a class="link" target='_blank' href="https://get.adblock-for-youtube.com/disable-adblockers">Find detailed instructions for whitelisting Youtube in most popular ad blocking extensions on our website.</a>
    ${checkboxHtml}
  </div>
`;

// language=CSS
const antiAdblockDetectedCss = `
  ${fontCss}

  .aby-popup > * {
      box-sizing: border-box;
  }
  
  .aby-popup > .top-block {
      margin-bottom: 8px;
  }

  .aby-popup {
      width: 390px;
      padding: 16px;
      font-family: Montserrat, sans-serif;
      overflow: hidden;
      color: #000;
      font-size: 14px;
      line-height: 20px;
      font-weight: 400;
      ${commonStyles}
  }
  
  ${headerCss}
  
  .detected {
      display: flex;
      align-items: center;
      margin-bottom: 16px;
  }
  
  .detected > p {
      font-size: 16px;
  }

  .detected > svg {
      margin-left: -16px;
  }

  .detected > * {
      flex: 1;
  }
  
  .info {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      padding-bottom: 14px;
  }

  .disable {
      padding-bottom: 14px;
  }
  
  .disable > span {
      font-weight: 500;
  }
  
  .link {
      display: inline-block;
      color: #D61717;
      font-weight: 600;
      line-height: 20px;
      padding-bottom: 14px;
      transition: color 0.3s ease-in-out;
  }
  
  ${checkboxCss}
  
  .checkbox {
      justify-content: flex-start;
  }
`;

const updatePopupHtml = `
  <div class='aby-popup'>
    ${headerHtml}
    <div>
      <div class='image'>
        <svg xmlns="http://www.w3.org/2000/svg" width="63" height="62" viewBox="0 0 63 62" fill="none">
          <path d="M15.2735 2.47029C8.4438 2.95467 7.47505 3.29373 5.48911 6.24842C3.69692 8.86404 3.35786 11.8187 3.06724 26.8828C2.67974 48.8734 3.45474 54.589 7.23286 57.7859C8.73442 59.0453 8.54067 58.9969 20.6016 59.9172C26.8016 60.4016 36.1985 60.4016 42.3985 59.9172C55.0891 58.9484 54.2172 59.0937 56.2516 57.3015C58.8672 54.9765 59.4485 52.5547 60.1266 41.7531C60.95 28.1422 59.9813 10.8984 58.1891 7.36248C56.6391 4.31092 55.0891 3.2453 51.6985 2.80936C46.6125 2.22811 21.9094 1.98592 15.2735 2.47029ZM47.6297 9.00936C49.9063 9.39686 52.086 11.4797 52.861 13.95C53.5875 16.3719 53.975 37.3937 53.3938 42.8672C52.9094 47.7594 51.8922 50.4234 50.0516 51.5859C48.1141 52.8937 34.1641 53.5719 23.2657 52.9422C13.4813 52.4094 12.6579 52.1187 11.011 48.825C9.6063 46.0156 8.87974 32.5984 9.6063 22.5234C10.4297 10.5109 11.2532 9.34842 19.1969 8.71873C24.3313 8.28279 44.5782 8.52498 47.6297 9.00936Z" fill="#D61717"/>
          <path d="M17.9375 30.5156V45.7734L25.1062 38.6047C29.0297 34.6813 32.4203 31.4844 32.6141 31.4844C32.8078 31.4844 32.9531 34.6813 32.9531 38.6047V45.7734L40.5578 38.1203L48.2109 30.5156L40.5578 22.9109L32.9531 15.2578V22.4266C32.9531 26.35 32.8078 29.5469 32.6141 29.5469C32.4203 29.5469 29.0297 26.35 25.1062 22.4266L17.9375 15.2578V30.5156Z" fill="#D61717"/>
        </svg>
      </div>
      <h1 class='headline'><span>Adblock for Youtube has been updated</span></h1>
      <p class='info'>
        We’re excited to announce the release of our latest extension,
        now upgraded to version  ${chrome.runtime.getManifest().version}!
        Explore the latest features and enhancements by visiting our update page.
      </p>
      <div class='links'>
        <a class='link' target='_blank' href='https://get.adblock-for-youtube.com/update'>See what's new</a>
      </div>
      ${checkboxHtml}
    </div>
  </div>
`;

// language=CSS
const updatePopupCss = `
  ${fontCss}
    
  .aby-popup > * {
    box-sizing: border-box;
  }

  .aby-popup {
    width: 305px;
    padding: 16px;
    font-family: Montserrat, sans-serif;
    overflow: hidden;
    ${commonStyles}
  }

  ${headerCss}
  
  .image {
    display: flex;
    justify-content: center;
    margin-bottom: 16px;
  }

  .headline {
    color: #313131;
    text-align: center;
    font-family: Montserrat, sans-serif;
    font-size: 18px;
    font-style: normal;
    font-weight: 600;
    line-height: 22px;
    margin-bottom: 12px;
  }

  .headline > span {
    display: inline-block;
    max-width: 200px;
  }

  .info {
    color: #313131;
    text-align: center;
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: 20px;
    margin-bottom: 16px;
  }

  .links {
    text-align: center;
    margin-bottom: 24px;
  }

  .link {
    color: #D61717;
    text-align: center;
    font-size: 16px;
    font-style: normal;
    font-weight: 500;
    line-height: 22px; /* 137.5% */
    text-decoration-line: underline;
    transition: color 0.3s ease-in-out;
  }
  
  .link:hover {
    color: #F97474;
  } 

  ${checkboxCss}
`;

const windowsPopupHtml = `
  <div class='aby-popup'>
    ${headerHtml}
    <div>
      <p class='info'>
        Do you know that we also have windows application that can keep you protected even when our extension can't? Visit our page to know more.
      </p>
      <a class='link' target='_blank' href='https://get.adblock-for-youtube.com/windows'>Go to our website</a>
    </div>
    ${checkboxHtml}
  </div>
`;

// language=CSS
const windowsPopupCss = `
  ${fontCss}
  
  .aby-popup > * {
      box-sizing: border-box;
  }

  .aby-popup {
      width: 350px;
      padding: 15px;
      font-family: Montserrat, sans-serif;
      overflow: hidden;
      ${commonStyles}
  }

  ${headerCss}

  .info {
      color: #000;
      text-align: center;
      font-size: 14px;
      font-style: normal;
      font-weight: 400;
      line-height: 20px;
      margin-bottom: 14px;
  }

  .link {
    font-size: 16px;
    font-weight: 600;
    background: #F2C94C;
    color: #000;
    display: block;
    padding: 10px;
    text-align: center;
    text-decoration: none;
    border-radius: 5px;
    margin-bottom: 18px;
    transition: background-color 0.3s ease-in-out;
  }
  
  .link:hover {
    background-color: #F8E095;
  }

  ${checkboxCss}
`;

const mobilePopupHtml = `
  <div class='aby-popup'>
  ${headerHtml}
    <div>
      <p class='info'>
        We also offer you a unique opportunity to install our new ad blocker on your mobile phone
      </p>
      <div class='links'>
        <a class='link' target='_blank' href='https://get.adblock-for-youtube.com/android'>
          <img src='data:image/png;base64,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' alt='Google Play' height='45px'>
        </a>
        <a class='link' target='_blank' href='https://get.adblock-for-youtube.com/iphone'>
          <img src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAk8AAAC0CAMAAAC60zivAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyNpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDIxIDc5LjE1NDkxMSwgMjAxMy8xMC8yOS0xMTo0NzoxNiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChNYWNpbnRvc2gpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkI2Njg4ODIyNTc4OTExRTQ5RDUyQTU0Rjk3NjJGODQ1IiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkI2Njg4ODIzNTc4OTExRTQ5RDUyQTU0Rjk3NjJGODQ1Ij4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6QjY2ODg4MjA1Nzg5MTFFNDlENTJBNTRGOTc2MkY4NDUiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6QjY2ODg4MjE1Nzg5MTFFNDlENTJBNTRGOTc2MkY4NDUiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz692hVEAAADAFBMVEUAAAD////w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' alt='App Store' height='45px'>
        </a>
      </div>
      ${checkboxHtml}
    </div>
  </div>
`;

// language=CSS
const mobilePopupCss = `
  ${fontCss}
    
  .aby-popup > * {
      box-sizing: border-box;
  }

  .aby-popup {
      width: 343px;
      padding: 16px;
      font-family: Montserrat, sans-serif;
      overflow: hidden;
      ${commonStyles}
  }

  ${headerCss}

  .info {
      color: #000;
      text-align: center;
      font-size: 14px;
      font-style: normal;
      font-weight: 400;
      line-height: 20px;
      margin-bottom: 14px;
  }

  .links {
      display: flex;
      justify-content: space-between;
      margin-bottom: 18px;
  }

  .link > img {
    border-radius: 9px;
  }
  
  .link {
    border-radius: 9px;
    height: 45px;
    transition: all 0.3s ease-in-out;
  }
  
  .link:hover {
    box-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.25);
  }

  ${checkboxCss}
`;

const otherStreamingPopupHtml = `
  <div class='aby-popup'>
    ${headerHtml}
    <div>
      <h3 class='headline'>Do you want to also block ads on other video streaming websites?</h3>
      <p class='info'>
        Visit our website to opt-in into experimental feature.
      </p>
      <a class='link' target='_blank' href='https://get.adblock-for-youtube.com/enable-additional-blocking?key=VZg4e13bFF1WkoDw9DNH'>Go to our website</a>
    </div>
    ${checkboxHtml}
  </div>
`;

// language=CSS
const otherStreamingPopupCss = `
    ${fontCss}

    .aby-popup > * {
        box-sizing: border-box;
    }

    .aby-popup {
        width: 350px;
        padding: 15px;
        font-family: Montserrat, sans-serif;
        overflow: hidden;
        color: #000;
        ${commonStyles}
    }

    ${headerCss}
    
    .headline {
        font-size: 18px;
        font-weight: 600;
        line-height: 20px;
        margin-bottom: 8px;
    }

    .info {
        text-align: left;
        font-size: 14px;
        font-style: normal;
        font-weight: 400;
        line-height: 20px;
        margin-bottom: 14px;
    }

    .link {
        font-size: 16px;
        font-weight: 600;
        background: #F2C94C;
        color: #000;
        display: block;
        padding: 10px;
        text-align: center;
        text-decoration: none;
        border-radius: 5px;
        margin-bottom: 18px;
        transition: background-color 0.3s ease-in-out;
    }

    .link:hover {
        background-color: #F8E095;
    }

    ${checkboxCss}

    .aby-popup .checkbox {
        justify-content: flex-start;
    }
`;

const POPUPS_MAP = {
  windows: {
    html: windowsPopupHtml,
    css: windowsPopupCss,
    restrictionKey: CONFIGURABLE_POPUP_RESTRICTION_KEY,
    doNotShowKey: CONFIGURABLE_POPUP_DO_NOT_SHOW_KEY,
    needSetDoNotShow: true,
  },
  mobile: {
    html: mobilePopupHtml,
    css: mobilePopupCss,
    restrictionKey: CONFIGURABLE_POPUP_RESTRICTION_KEY,
    doNotShowKey: CONFIGURABLE_POPUP_DO_NOT_SHOW_KEY,
    needSetDoNotShow: true,
  },
  update: {
    html: updatePopupHtml,
    css: updatePopupCss,
    restrictionKey: UPDATE_POPUP_RESTRICTION_KEY,
    doNotShowKey: UPDATE_POPUP_DO_NOT_SHOW_KEY,
    needSetDoNotShow: false,
  },
  "anti-adblock": {
    html: antiAdblockDetectedHtml,
    css: antiAdblockDetectedCss,
    restrictionKey: ANTI_ADBLOCK_POPUP_RESTRICTION_KEY,
    doNotShowKey: ANTI_ADBLOCK_POPUP_DO_NOT_SHOW_KEY,
    needSetDoNotShow: false,
  },
  "other-streaming": {
    html: otherStreamingPopupHtml,
    css: otherStreamingPopupCss,
    restrictionKey: OTHER_STREAMING_RESTRICTION_KEY,
    doNotShowKey: OTHER_STREAMING_POPUP_DO_NOT_SHOW_KEY,
    needSetDoNotShow: false,
  },
};

const minutesToMilliseconds = (minutes) => {
  return minutes * 60000;
};

const isIframe = () => {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
};

class YoutubeBlocker {
  constructor(enabled, adBlockSelectors, popupConfig) {
    const filters = [
      new CosmeticFilter(adBlockSelectors),
      new Dialog(popupConfig),
    ];

    if (enabled) {
      filters.forEach((filter) => {
        filter.start();
      });
    }
  }
}

const getIsCommonPopupRestrictionsExpired = async () => {
  return new Promise((resolve) => {
    chrome.storage.local.get(
      [INSTALLED_AT_KEY, POPUP_GENERAL_RESTRICTION_KEY],
      (result) => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
          resolve(false);
        }

        const now = Date.now();
        const installedAt = result[INSTALLED_AT_KEY];
        const popupGeneralRestriction = result[POPUP_GENERAL_RESTRICTION_KEY];

        if (!installedAt || now - installedAt < MIN_USER_LIVE_FOR_POPUP) {
          console.log("User is too new");
          resolve(false);
        }

        if (
          popupGeneralRestriction &&
          now - popupGeneralRestriction < GENERAL_POPUPS_RESTRICTION_TIME
        ) {
          console.log("General popup restriction");

          resolve(false);
        }

        resolve(true);
      }
    );
  });
};

class Dialog {
  popupConfig = {};

  constructor(popupConfig) {
    this.popupConfig = popupConfig;
  }

  appendPopup(dialog) {
    domReady(() => {
      document.body.appendChild(dialog);
    });
  }

  addCloseButtonListener(dialog, dateRestrictionKey, doNotShowKey) {
    dialog.querySelector(".close").addEventListener("click", () => {
      const isInputChecked = document.querySelector(".checkbox-input").checked;

      const storageKeyRestriction = {
        [dateRestrictionKey]: Date.now(),
      };

      if (dateRestrictionKey !== ANTI_ADBLOCK_POPUP_RESTRICTION_KEY) {
        storageKeyRestriction[POPUP_GENERAL_RESTRICTION_KEY] = Date.now()
      }

      if (isInputChecked) {
        storageKeyRestriction[doNotShowKey] = true;
      }

      this.handlePopupClose(dialog, storageKeyRestriction);
    });
  }

  addLinkClickListener(
    dialog,
    dateRestrictionKey,
    doNotShowKey,
    needSetDoNotShow
  ) {
    dialog.querySelectorAll(".link").forEach((link) => {
      link.addEventListener("click", () => {
        const restrictionConfig = {
          [dateRestrictionKey]: Date.now(),
          [POPUP_GENERAL_RESTRICTION_KEY]: Date.now(),
        };

        if (needSetDoNotShow) {
          restrictionConfig[doNotShowKey] = true;
        }

        this.handlePopupClose(dialog, restrictionConfig);
      });
    });
  }

  handlePopupClose(dialog, storageKeyRestriction) {
    document.body.removeChild(dialog);

    chrome.storage.local.set(storageKeyRestriction, () => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
      }
    });
  }

  createConfigurablePopup(popupType) {
    const popupLayout = POPUPS_MAP[popupType];

    if (!popupLayout) {
      return;
    }
    const { html, css, restrictionKey, doNotShowKey, needSetDoNotShow } =
      popupLayout;

    const configurablePopup = document.createElement("DIV");
    configurablePopup.classList.add("ab4yt-popup");
    configurablePopup.innerHTML = html;

    this.addLinkClickListener(
      configurablePopup,
      restrictionKey,
      doNotShowKey,
      needSetDoNotShow
    );

    this.addCloseButtonListener(
      configurablePopup,
      restrictionKey,
      doNotShowKey
    );

    const stylesheet = document.createElement("style");
    stylesheet.setAttribute("type", "text/css");
    stylesheet.innerText = css;

    configurablePopup.appendChild(stylesheet);

    this.appendPopup(configurablePopup);
  }

  createRateUsPopup() {
    const handleClose = () => {
      this.handlePopupClose(dialog, {
        [RATING_POPUP_RESTRICTION_KEY]: true,
        [POPUP_GENERAL_RESTRICTION_KEY]: Date.now(),
      });
    };

    // Create dialog
    const dialog = document.createElement("DIV");
    dialog.classList.add("ab4yt-dialog");

    // Create closeIcon
    const closeIcon = document.createElement("A");
    closeIcon.classList.add("ab4yt-close-icon");
    closeIcon.appendChild(document.createTextNode(" "));
    closeIcon.addEventListener("click", handleClose);
    dialog.appendChild(closeIcon);

    // Create header
    const header = document.createElement("DIV");
    header.appendChild(
      document.createTextNode(chrome.i18n.getMessage("extension_name"))
    );
    header.classList.add("ab4yt-dialog-header");
    dialog.appendChild(header);

    // Create ShareLink
    const webstoreLink = document.createElement("A");
    webstoreLink.classList.add("ab4yt-webstore-link");
    webstoreLink.setAttribute("href", `${WEBSTORE_LINK}/reviews`);
    webstoreLink.setAttribute("target", "_blank");
    webstoreLink.appendChild(
      document.createTextNode(chrome.i18n.getMessage("rate_this_extension"))
    );
    webstoreLink.addEventListener("click", handleClose);
    dialog.appendChild(webstoreLink);

    const stylesheet = document.createElement("style");
    stylesheet.type = "text/css";
    stylesheet.appendChild(
      document.createTextNode(`
      .ab4yt-dialog {
        display: none;
        background-color: #000000c7;
        position: fixed;
        right: 10px;
        z-index: 99999999999;
        top: 68px;
        padding: 0;
        margin: 0;
        border-radius: 4px;
        border: 1px solid white;
        text-align: center;
      }

      .ab4yt-close-icon {
        cursor: pointer;
        position: absolute;
        right: 10px;
        top: 10px;
        width: 10px;
        height: 10px;
        opacity: 0.8;
      }
      .ab4yt-close-icon:hover {
        opacity: 1;
      }
      .ab4yt-close-icon:before, .ab4yt-close-icon:after {
        position: absolute;
        left: 5px;
        content: ' ';
        height: 10px;
        width: 2px;
        background-color: white;
      }
      .ab4yt-close-icon:before {
        transform: rotate(45deg);
      }
      .ab4yt-close-icon:after {
        transform: rotate(-45deg);
      }

      .ab4yt-dialog-header {
        font-size: 16px;
        padding: 16px 24px;
        color: white;
      }

      .ab4yt-webstore-link {
        display: block;
        font-size: 13px;
        color: white;
        padding: 16px 24px;
        text-decoration: none;
        opacity: 0.8;
        border-top: 1px solid white;
        text-transform: uppercase;
      }

      .ab4yt-webstore-link:hover {
        opacity: 1;
      }
    `)
    );
    dialog.appendChild(stylesheet);
    dialog.style.display = "block";

    this.appendPopup(dialog);
  }

  checkAntiAdBlock() {
    document.addEventListener("yt-navigate-finish", () => {
      chrome.storage.local.get(
        [
          ANTI_ADBLOCK_POPUP_DO_NOT_SHOW_KEY,
          ANTI_ADBLOCK_POPUP_RESTRICTION_KEY,
        ],
        async (result) => {
          const now = Date.now();

          const antiAdblockPopupRestriction =
            result[ANTI_ADBLOCK_POPUP_RESTRICTION_KEY];
          const antiAdblockPopupDoNotShow =
            result[ANTI_ADBLOCK_POPUP_DO_NOT_SHOW_KEY];

          setTimeout(() => {
            if (
              window.location.href.includes("/watch") &&
              document.querySelector("#error-screen>#container")?.children.length
            ) {
              if (
                !antiAdblockPopupDoNotShow &&
                (!antiAdblockPopupRestriction ||
                  now - antiAdblockPopupRestriction >
                  ANTI_ADBLOCK_POPUP_RESTRICTION_TIME)
              ) {
                document
                  .querySelectorAll(".ab4yt-dialog,.ab4yt-popup")
                  .forEach((dialog) => dialog.remove());
                this.createConfigurablePopup("anti-adblock");
              }
            }
          }, 100);
        }
      );
    });
  }

  start() {
    if (isIframe()) {
      return;
    }
    // this.createConfigurablePopup('update');
    if (this.popupConfig.isAntiAdblockPopupEnabled) {
      this.checkAntiAdBlock();
    }

    chrome.storage.local.get(
      [
        UPDATE_POPUP_RESTRICTION_KEY,
        UPDATE_POPUP_DO_NOT_SHOW_KEY,
        CONFIGURABLE_POPUP_RESTRICTION_KEY,
        CONFIGURABLE_POPUP_DO_NOT_SHOW_KEY,
        RATING_POPUP_RESTRICTION_KEY,
      ],
      async (result) => {
        const isCommonRestrictionsExpired =
          await getIsCommonPopupRestrictionsExpired();

        const now = Date.now();

        const updatePopupRestriction = result[UPDATE_POPUP_RESTRICTION_KEY];
        const updatePopupDoNotShow = result[UPDATE_POPUP_DO_NOT_SHOW_KEY];

        const configurablePopupRestriction =
          result[CONFIGURABLE_POPUP_RESTRICTION_KEY];
        const configurablePopupDoNotShow =
          result[CONFIGURABLE_POPUP_DO_NOT_SHOW_KEY];
        const configurablePopupDoNotShowAgainMilliseconds =
          minutesToMilliseconds(
            this.popupConfig.configurablePopup.doNotShowAgainMinutes
          );

        const ratingPopupRestriction = result[RATING_POPUP_RESTRICTION_KEY];

        if (!isCommonRestrictionsExpired) {
          return;
        }

        if (
          !updatePopupRestriction &&
          !updatePopupDoNotShow &&
          this.popupConfig.isUpdatePopupEnabled
        ) {
          this.createConfigurablePopup("update");
          return;
        }

        if (
          !configurablePopupDoNotShow &&
          this.popupConfig.configurablePopup.isEnabled &&
          (!configurablePopupRestriction ||
            now - configurablePopupRestriction >
              configurablePopupDoNotShowAgainMilliseconds)
        ) {
          this.createConfigurablePopup(this.popupConfig.configurablePopup.type);
          return;
        }

        if (!ratingPopupRestriction && this.popupConfig.isRateUsPopupEnabled) {
          try {
            this.createRateUsPopup();
            return;
          } catch (e) {
            console.error(e);
          }
        }

        console.log("No popup to show");
      }
    );
  }
}

class CosmeticFilter {
  adBlockSelectors = [];

  constructor(adBlockSelectors) {
    this.adBlockSelectors = adBlockSelectors;
  }

  start() {
    if (!this.adBlockSelectors) {
      return;
    }

    const cssContent = `${this.adBlockSelectors.join(",")} { display: none !important; }`;

    const styleEl = document.createElement("style");
    styleEl.setAttribute("type", "text/css");
    styleEl.textContent = cssContent;
    (document.head || document.documentElement).appendChild(styleEl);
  }
}

class DailymotionDialog {
  popupConfig = {};

  constructor(popupConfig) {
    this.popupConfig = popupConfig;
  }

  appendPopup(dialog) {
    domReady(() => {
      document.body.appendChild(dialog);
    });
  }

  addCloseButtonListener(dialog, dateRestrictionKey, doNotShowKey) {
    dialog.querySelector(".close").addEventListener("click", () => {
      const isInputChecked = document.querySelector(".checkbox-input").checked;

      const storageKeyRestriction = {
        [dateRestrictionKey]: Date.now(),
        [POPUP_GENERAL_RESTRICTION_KEY]: Date.now(),
      };

      if (isInputChecked) {
        storageKeyRestriction[doNotShowKey] = true;
      }

      this.handlePopupClose(dialog, storageKeyRestriction);
    });
  }

  addLinkClickListener(
    dialog,
    dateRestrictionKey,
    doNotShowKey,
    needSetDoNotShow
  ) {
    dialog.querySelectorAll(".link").forEach((link) => {
      link.addEventListener("click", () => {
        const restrictionConfig = {
          [dateRestrictionKey]: Date.now(),
          [POPUP_GENERAL_RESTRICTION_KEY]: Date.now(),
        };

        if (needSetDoNotShow) {
          restrictionConfig[doNotShowKey] = true;
        }

        this.handlePopupClose(dialog, restrictionConfig);
      });
    });
  }

  handlePopupClose(dialog, storageKeyRestriction) {
    document.body.removeChild(dialog);

    chrome.storage.local.set(storageKeyRestriction, () => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
      }
    });
  }

  createConfigurablePopup(popupType) {
    const popupLayout = POPUPS_MAP[popupType];

    if (!popupLayout) {
      return;
    }
    const { html, css, restrictionKey, doNotShowKey, needSetDoNotShow } =
      popupLayout;

    const configurablePopup = document.createElement("DIV");
    configurablePopup.classList.add("ab4yt-popup");
    configurablePopup.innerHTML = html;

    this.addLinkClickListener(
      configurablePopup,
      restrictionKey,
      doNotShowKey,
      needSetDoNotShow
    );

    this.addCloseButtonListener(
      configurablePopup,
      restrictionKey,
      doNotShowKey
    );

    const stylesheet = document.createElement("style");
    stylesheet.setAttribute("type", "text/css");
    stylesheet.innerText = css;

    configurablePopup.appendChild(stylesheet);

    this.appendPopup(configurablePopup);
  }

  start() {
    if (isIframe()) {
      return;
    }
    // this.createConfigurablePopup('update');

    chrome.storage.local.get(
      [
        OTHER_STREAMING_RESTRICTION_KEY,
        OTHER_STREAMING_POPUP_DO_NOT_SHOW_KEY,
        IS_ADDITIONAL_BLOCKING_ENABLED,
      ],
      async (result) => {
        const isCommonRestrictionsExpired =
          await getIsCommonPopupRestrictionsExpired();
        const now = Date.now();

        const otherStreamingRestriction =
          result[OTHER_STREAMING_RESTRICTION_KEY];
        const otherStreamingPopupDoNotShow =
          result[OTHER_STREAMING_POPUP_DO_NOT_SHOW_KEY];

        const isAdditionalBlockingEnabled =
          result[IS_ADDITIONAL_BLOCKING_ENABLED];

        if (!isCommonRestrictionsExpired) {
          return;
        }

        if (
          !otherStreamingPopupDoNotShow &&
          !isAdditionalBlockingEnabled &&
          this.popupConfig.isOtherStreamingPopupEnabled &&
          (!otherStreamingRestriction ||
            now - otherStreamingRestriction > OTHER_STREAMING_RESTRICTION_TIME)
        ) {
          this.createConfigurablePopup("other-streaming");
          return;
        }

        console.log("No popup to show");
      }
    );
  }
}

class DailymotionBlocker {
  constructor(enabled, adBlockSelectors, isAdditionalBlockingEnabled, popupConfig) {
    const filters = [new CosmeticFilter(adBlockSelectors)];

    if (enabled) {
      new DailymotionDialog(popupConfig).start();
    }

    if (isAdditionalBlockingEnabled) {
      filters.forEach((filter) => {
        filter.start();
      });
    }
  }
}

class AdditionalBlockingEnableHandler {
  constructor(enabled) {
    if (enabled) {
      this.init().catch((error) => {
        console.error(error);
      });
    }
  }

  async init() {
    const additionalActivateButtons = await waitForElement(
      ".activate_additional_blocking_X3patIvPJ8"
    );

    additionalActivateButtons.addEventListener("click", () => {
      chrome.runtime.sendMessage(
        {
          action: "ENABLE_ADDITIONAL_BLOCKING",
        },
        () => {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
          }
        }
      );
    });
  }
}

function domReady(callback) {
  if (document.readyState === "complete") {
    callback();
  } else {
    window.addEventListener("load", callback, {
      once: true,
    });
  }
}

const waitForElement = async (selector) => {
  return new Promise((resolve) => {
    let observedElement = document.querySelector(selector);
    if (observedElement) return resolve(observedElement);

    let observer = new MutationObserver(() => {
      let observedElement = document.querySelector(selector);
      if (observedElement) {
        observer.disconnect();
        resolve(observedElement);
      }
    });

    observer.observe(document.documentElement, {
      childList: !0,
      subtree: !0,
    });
  });
};

(() => {
  // Notify background so it can inject cosmetic filter
  const pageUrl = new URL(window.location.href);
  const isWrongUrl = !(/youtube\.com/.test(window.location.href) || /dailymotion\.com/.test(window.location.href) || pageUrl.searchParams.get("key") === "VZg4e13bFF1WkoDw9DNH");
  if (isWrongUrl) return;

  chrome.runtime.sendMessage(
    {
      action: "PAGE_READY",
    },
    (response) => {
      if(!response) return;

      const {
        enabled,
        adBlockSelectors,
        popupConfig,
        dailymotionAdBlockingSelectors,
        isAdditionalBlockingEnabled,
      } = response;

      if (/youtube\.com/.test(window.location.origin)) {
        new YoutubeBlocker(enabled, adBlockSelectors, popupConfig);
      } else if (/dailymotion\.com/.test(window.location.origin)) {
        new DailymotionBlocker(
          enabled,
          dailymotionAdBlockingSelectors,
          isAdditionalBlockingEnabled,
          popupConfig
        );
      } else if (pageUrl.searchParams.get("key") === "VZg4e13bFF1WkoDw9DNH") {
        new AdditionalBlockingEnableHandler(enabled);
      }
    }
  );
})();
