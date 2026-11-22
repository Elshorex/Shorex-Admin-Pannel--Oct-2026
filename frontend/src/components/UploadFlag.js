// import React, { useEffect, useState } from "react";
// import { Box, Button, Typography } from "@mui/material";
// import { CloudUpload as CloudUploadIcon } from "@mui/icons-material";
// import { FormattedMessage } from "react-intl";

// import axios, { baseURL } from "../constants/api";
// import { useAuthState } from "../context";
// import { useLanguage } from "../hooks/useLanguage";
// import { LoadingButton } from "@mui/lab";
// import EditIcon from "@mui/icons-material/Edit";
// import { checkFileType } from "./utils/Helper";

// function UploadFlag({
//   imgLoading,
//   setImgLoading,
//   setValue,
//   param,
//   currentImg,
// }) {
//   const user = useAuthState();
//   const { locale } = useLanguage();

//   const [selectedFile, setSelectedFile] = useState(null);
//   const [selectedCurrentImg, setSelectedCurrentImg] = useState(null);

//   useEffect(() => {
//     setSelectedCurrentImg(currentImg);
//   }, [currentImg]);

//   const handleFileChange = (event) => {
//     const file = event.target.files[0];
//     setSelectedFile(file);
//   };

//   const handleOpen = () => {
//     document.getElementById("fileInput").click();
//   };

//   const handleSubmit = async () => {
//     const formData = new FormData();
//     formData.append("image", selectedFile);
//     setImgLoading(true);
//     try {
//       const res = await axios.post(`${baseURL.PRO}admin/uploadImage`, formData, {
//         headers: {
//           "Content-Type": "multipart/form-data",
//           Authorization: user.token,
//           "Accept-Language": locale,
//         },
//       });
//       setValue(param ? param : "image", res?.data?.link);
//     } catch (error) {}
//     setImgLoading(false);
//   };

//   useEffect(() => {
//     selectedFile && handleSubmit();
//   }, [selectedFile]);

//   return (
//     <Box>
//       {selectedFile || selectedCurrentImg ? (
//         <Typography variant="h3">
//           <a 
//             href={
//               selectedCurrentImg
//                 ? baseURL + selectedCurrentImg
//                 : URL.createObjectURL(selectedFile)
//             }
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             {selectedCurrentImg
//               ? checkFileType(selectedCurrentImg)
//               : selectedFile.name}
//           </a>
//           <Button
//             onClick={(e) => {
//               e.stopPropagation();
//               setSelectedCurrentImg(null);
//               setSelectedFile(null);
//             }}
//           >
//             <EditIcon
//               sx={{
//                 fontSize: 20,
//               }}
//             />
//           </Button>
//         </Typography>
//       ) : (
//         <LoadingButton
//           loading={imgLoading}
//           variant="contained"
//           startIcon={<CloudUploadIcon sx={{ mx: "4px" }} />}
//           onClick={handleOpen}
//         >
//           <Typography variant="h3">
//             <FormattedMessage id="countries.upload" />
//           </Typography>
//           <input
//             id="fileInput"
//             type="file"
//             style={{ display: "none" }}
//             onChange={handleFileChange}
//           />
//         </LoadingButton>
//       )}
//     </Box>
//   );
// }

// export default UploadFlag;


import React, { useEffect, useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { CloudUpload as CloudUploadIcon } from "@mui/icons-material";
import { FormattedMessage } from "react-intl";

import axios, { baseURL } from "../constants/api";
import { useAuthState } from "../context";
import { useLanguage } from "../hooks/useLanguage";
import { LoadingButton } from "@mui/lab";
import EditIcon from "@mui/icons-material/Edit";
import { checkFileType } from "./utils/Helper";

function UploadFlag({
  imgLoading,
  setImgLoading,
  setValue,
  param,
  currentImg,
}) {
  const user = useAuthState();
  const { locale } = useLanguage();

  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedCurrentImg, setSelectedCurrentImg] = useState(null);

  useEffect(() => {
    setSelectedCurrentImg(currentImg);
  }, [currentImg]);


  // NEW: Detect media type
  const detectMediaType = (file) => {
    const mime = file.type.split("/")[0]; // "image" or "video"
    return mime === "image" ? "IMAGE" : "VIDEO";
  };


  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  const handleOpen = () => {
    document.getElementById("fileInput").click();
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append("image", selectedFile);
    setImgLoading(true);

    try {
      const res = await axios.post(`${baseURL.PRO}admin/uploadImage`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: user.token,
          "Accept-Language": locale,
        },
      });

      setValue(param ? param : "image", res?.data?.link);

      // NEW: Dynamically set mediaType
      const mediaType = detectMediaType(selectedFile);
      setValue("mediaType", mediaType);

    } catch (error) {}

    setImgLoading(false);
  };

  useEffect(() => {
    selectedFile && handleSubmit();
  }, [selectedFile]);

  return (
    <Box>
      {selectedFile || selectedCurrentImg ? (
        <Typography variant="h3">
          <a 
            href={
              selectedCurrentImg
                ? baseURL + selectedCurrentImg
                : URL.createObjectURL(selectedFile)
            }
            target="_blank"
            rel="noopener noreferrer"
          >
            {selectedCurrentImg
              ? checkFileType(selectedCurrentImg)
              : selectedFile.name}
          </a>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedCurrentImg(null);
              setSelectedFile(null);
            }}
          >
            <EditIcon sx={{ fontSize: 20 }} />
          </Button>
        </Typography>
      ) : (
        <LoadingButton
          loading={imgLoading}
          variant="contained"
          startIcon={<CloudUploadIcon sx={{ mx: "4px" }} />}
          onClick={handleOpen}
        >
          <Typography variant="h3">
            <FormattedMessage id="countries.upload" />
          </Typography>
          <input
            id="fileInput"
            type="file"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
        </LoadingButton>
      )}
    </Box>
  );
}

export default UploadFlag;

