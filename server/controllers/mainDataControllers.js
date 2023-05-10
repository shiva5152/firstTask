import catchAsyncError from "../middleware/catchAsyncError.js";
import MainData from "../models/MainData.js"
import XLSX from 'xlsx';
import ErrorHandler from "../utils/errorHandler.js";
import stringToDate from "../utils/stringToDate.js";
import moment from "moment";

 

const upload = catchAsyncError(async (req, res, next) => {
    try {
      const file = req.file;
      console.log(req.file);
      console.log("here")
      const workbook = XLSX.readFile(file.path);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      for (const row of jsonData) {
        const documentData = {
          placeId: row['Place-ID'],
          place: row['Place'],
          appNumber: row['APP No.'],
          company: row['Company'],
          yearOfPurchase: row['Year Of Purchase'],
          customerName: row['CUSTOMER NAME'],
          GSV: row['GSV'],
          CSV: row['CSV'],
          deposit: row['Deposit'],
          status: row['Status'],
          outstanding: row['Outstanding'],
          yearTillNow: row['Year Till Now'],
          currentValue: row['Current Value '],
          afterDeductingLicenseFees: row['After Deducting License Fees'],
          remarks: row['Remarks']
        };

        const appDate = stringToDate(row['APP DATE'].toString());
        if (moment(appDate).isValid()) {
            documentData.appDate = appDate.format('YYYY-MM-DD');
          }
         
        const data=await MainData.findOne({appNumber: documentData.appNumber});
        if(data){
          console.log(data);
          break;
        }
        const document = new MainData(documentData);
        await document.save();
      }
  
      res.status(200).json({
        success:true,
        message:'File uploaded successfully'
    })
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success:false,
        message:'Error occurred while uploading the file'
    })   
    }
  });

  const getData=catchAsyncError(async(req,res,next)=>{
    // console.log("getData")
    const {status,place,yearOfPurchase,customerName}=req.query;
    

    const queryObject = {};
    if (status && status !== 'All') {
        queryObject.status = status;
    }
    if (place && place !== 'All') {
        queryObject.place = place;
    }
    if (yearOfPurchase) {
        queryObject.yearOfPurchase = yearOfPurchase;
    }
    if (customerName) {
        queryObject.customerName = { $regex: customerName, $options: 'i' };
      }
    console.log(queryObject);
    const result=await MainData.find(queryObject)

    res.status(200).json({
        success:true,
        result,
       
    })
  })
  

    export {upload,getData}