import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);




export function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function validateEmail(email) {
  var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

export function removeHyphensAndCapitalize(string) {
  return string.replace(/-/g, ' ').replace(/(^\w|\s\w)/g, m => m.toUpperCase())

}

export function displayTime(timestamp) {
  if (!timestamp) return "No date provided";
  return dayjs(Number(timestamp)).format("MMM DD, YYYY [at] hh:mm a");
}

export function displayTimeDashBoard() {
  var rightNow = dayjs().format("MMM DD, YYYY [at] hh:mm:ss a");

  setInterval(displayTimeDashBoard, 1000);
  return rightNow;
}


export function hashSearch(array, target) {
  const hashMap = new Map();

  // Create a hash map to store the coffee house names and their indices
  array.forEach((coffeehouse, index) => {

    //array.forEach() method is used to iterate over each coffeehouse in the array
    // coffeehouse is the current element being processed in the array
    // index is the current index of the coffeehouse in the array
    // coffeehouse.coffeeName is the key, and index is the value
    // hashMap.set(coffeehouse.coffeeName, index) will do the following:
    // 1. coffeehouse.coffeeName is the key, which is the name of the coffee house
    // 2. index is the value, which is the index of the coffee house in the array
    // 3. hashMap.set(coffeehouse.coffeeName, index) will add the key-value pair to the hash map
    // 4. If the key already exists in the hash map, it will update the value with the new index
    hashMap.set(coffeehouse.coffeeName, index);
  });

  // Check if the target coffee house name exists in the hash map
  if (hashMap.has(target)) {
    return hashMap.get(target); // Return the index of the target coffee house
  }

  return -1; // Target not found
}






export function binarySearch(array, target) {
  const sortedArray = array.map((coffeehouse) => coffeehouse).sort();
  // const arr =[
  //   { coffeeName: "Starbucks" },
  //   { coffeeName: "Dunkin" },
  //   { coffeeName: "Peet's Coffee" },
  //   { coffeeName: "Blue Bottle Coffee" },
  //   { coffeeName: "Intelligentsia Coffee" },
  // ];
  // const hh = arr.map((coffeehouse) => coffeehouse.coffeeName).sort();

  // console.log("Original Array:", arr);
  // console.log("Sorted Array:", hh);
  console.log("Sorted Array:", sortedArray);

  let left = 0;
  let right = sortedArray.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    if (sortedArray[mid] === target) {
      return mid; // Target found at index mid
    }
    if (sortedArray[mid].coffeeName < target) {
      left = mid + 1; // Search in the right half
    } else {
      right = mid - 1; // Search in the left half
    }
  }

  return -1; // Target not found
}



