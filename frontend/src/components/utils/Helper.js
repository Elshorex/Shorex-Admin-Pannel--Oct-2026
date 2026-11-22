export function filterData(searchText, userData) {
  const data = userData.filter((item) =>
    item?.name.toLowerCase().includes(searchText.toLowerCase())
  );
  return data;
}

export const removeProperty = (obj, propToRemove) => {
  // Get all the keys of the object
  const keys = Object.keys(obj);

  // Create a new object excluding the specified property
  const newObj = {};
  for (const key of keys) {
    if (key !== propToRemove) {
      newObj[key] = obj[key];
    }
  }

  return newObj;
};

export const removeEmptyParameters = (obj) => {
  const newObj = {};
  for (const key in obj) {
    const value = obj[key];
    if (
      value !== null &&
      value !== undefined &&
      value !== "" &&
      !(Array.isArray(value) && value.length === 0)
    ) {
      if (typeof value === "object" && !Array.isArray(value)) {
        newObj[key] = removeEmptyParameters(value); // Recursive call for nested objects
      } else {
        newObj[key] = value;
      }
    }
  }
  return newObj;
};

export function isValidDate(dateString) {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

export function formatNumberWithCommas(number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


export function getClaimPoints(claimRequestData){
    console.log(claimRequestData,'claim')

    let donationAmount=0,claimAmount=0;
    claimRequestData?.forEach(claimRequest => {
      donationAmount = donationAmount +  claimRequest.donationAmount
      claimAmount = claimAmount + claimRequest.redeemAmount
    })
    return { donationAmount:donationAmount,claimAmount:claimAmount}
}

export function checkFileType(url) {
  // Regular expression to check for .png, .jpg, or .jpeg extensions at the end of the URL
  if (url) {
    const imageExtensions = /\.(png|jpe?g)$/i;

    if (imageExtensions.test(url)) {
      return "image";
    } else {
      return "Video";
    }
  }
}

// Example usage
checkFileType("/uploads/admins/ccae11a9-6ce5-4224-93a0-38bb9f2c7244.jpg");
