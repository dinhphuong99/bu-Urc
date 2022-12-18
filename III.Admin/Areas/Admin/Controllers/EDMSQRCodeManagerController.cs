using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class EDMSQRCodeManagerController : BaseController
    {
        private readonly EIMDBContext _context;

        public EDMSQRCodeManagerController(EIMDBContext context)
        {
            _context = context;
        }

        public IActionResult Index()
        {
            return View();
        }

        public class EDMSWhsQrCodeJtable
        {
            public int Id { get; set; }

            public string OBJ_Code { get; set; }

            public string QR_Code { get; set; }

            public string OBJ_Type { get; set; }
            public string UpdatedBy { get; set; }

            public DateTime? UpdatedTime { get; set; }
            public string CreatedBy { get; set; }
            public DateTime? CreatedTime { get; set; }
            public int? PrintNumber { get; set; }
            public string GivenName { get; set; }
        }

        [HttpPost]
        public object JTable([FromBody]JTableQRCodeModel jTablePara)
        {
            var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.EDMSWhsQrCodes
                        join b in _context.Users.Where(x => x.Active == true) on a.CreatedBy equals b.UserName into b1
                        from b in b1.DefaultIfEmpty()
                        where (string.IsNullOrEmpty(jTablePara.ObjType) || a.OBJ_Type.Equals(jTablePara.ObjType))
                            && (string.IsNullOrEmpty(jTablePara.CreatedBy) || a.CreatedBy.Equals(jTablePara.CreatedBy))
                            && ((fromDate == null) || (a.CreatedTime.HasValue && a.CreatedTime.Value.Date >= fromDate))
                            && ((toDate == null) || (a.CreatedTime.HasValue && a.CreatedTime.Value.Date <= toDate))
                        select new EDMSWhsQrCodeJtable
                        {
                            Id = a.Id,
                            OBJ_Code = a.OBJ_Code,
                            OBJ_Type = a.OBJ_Type,
                            QR_Code = a.QR_Code,
                            UpdatedBy = a.UpdatedBy,
                            UpdatedTime = a.UpdatedTime,
                            CreatedBy = a.CreatedBy,
                            CreatedTime = a.CreatedTime,
                            PrintNumber = a.PrintNumber,
                            GivenName = b.GivenName,

                        };

            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            foreach (var item in data)
            {
                item.QR_Code = CommonUtil.GenerateQRCode(item.OBJ_Code);
            }
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "OBJ_Code", "OBJ_Type", "QR_Code", "PrintNumber", "CreatedBy", "CreatedTime", "GivenName");
            return Json(jdata);
        }

        [HttpGet]
        public object GetListWareHouse()
        {
            try
            {
                var rs = _context.EDMSWareHouses.Where(x => x.WHS_Flag != true && x.Type == "RV").ToList();
                return Json(rs);
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }

        [HttpGet]
        public object GetWareHouseById(int id)
        {
            try
            {
                var rs = _context.EDMSWareHouses.Where(x => x.Id.Equals(id)).FirstOrDefault();
                return Json(rs);
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }

        [HttpGet]
        public object GetFloorById(int id)
        {
            try
            {
                var rs = _context.EDMSFloors.Where(x => x.Id.Equals(id)).FirstOrDefault();
                return Json(rs);
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }

        [HttpGet]
        public object GetLineById(int id)
        {
            try
            {
                var rs = _context.EDMSLines.Where(x => x.Id.Equals(id)).FirstOrDefault();
                return Json(rs);
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }

        [HttpGet]
        public object GetRackById(int id)
        {
            try
            {
                var rs = _context.EDMSRacks.Where(x => x.Id.Equals(id)).FirstOrDefault();
                return Json(rs);
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }

        [HttpGet]
        public object GetFloorByWareHouseCode(string wareHouseCode)
        {
            try
            {
                var rs = _context.EDMSFloors.Where(x => x.WHS_Code.Equals(wareHouseCode)).FirstOrDefault();
                return Json(rs);
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }

        [HttpGet]
        public object GetLineByFloorCode(string floorCode)
        {
            try
            {
                var rs = _context.EDMSLines.Where(x => x.FloorCode.Equals(floorCode)).FirstOrDefault();
                return Json(rs);
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }

        [HttpGet]
        public object GetRackByLineCode(string lineCode)
        {
            try
            {
                var rs = _context.EDMSRacks.Where(x => x.LineCode.Equals(lineCode)).FirstOrDefault();
                return Json(rs);
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }

        //Gen mã QRCode
        [HttpGet]
        public string GenWareHouseCode()
        {
            var wareHouseCode = string.Empty;
            try
            {
                //Quy tắc sinh mã (WH_GUID)

                var guid = Guid.NewGuid().ToString().ToUpper().Substring(0, 4);

                wareHouseCode = string.Format("{0}_{1}", "WH", guid);
            }
            catch (Exception ex)
            {

                throw ex;
            }

            return wareHouseCode;
        }

        [HttpGet]
        public string GenFloorCode(string wareHouseCode)
        {
            var floorCode = string.Empty;
            try
            {
                //Quy tắc sinh mã (WH_MÃ KHO_F_GUID)

                var guid = Guid.NewGuid().ToString().ToUpper().Substring(0, 4);

                floorCode = string.Format("{0}_{1}_{2}_{3}", "WH", wareHouseCode, "F", guid);
            }
            catch (Exception ex)
            {

                throw ex;
            }

            return floorCode;
        }

        [HttpGet]
        public string GenLineCode(string wareHouseCode, string floorCode)
        {
            var lineCode = string.Empty;
            try
            {
                //Quy tắc sinh mã (MÃ KHO_MÃ TẦNG_L_GUID)

                var guid = Guid.NewGuid().ToString().ToUpper().Substring(0, 4);

                lineCode = string.Format("{0}_{1}_{2}_{3}", wareHouseCode, floorCode, "L", guid);
            }
            catch (Exception ex)
            {

                throw ex;
            }

            return lineCode;
        }

        [HttpGet]
        public string GenRackCode(string wareHouseCode, string floorCode, string lineCode)
        {
            var rackCode = string.Empty;
            try
            {
                //Quy tắc sinh mã (MÃ KHO_MÃ TẦNG_MÃ DÃY_R_GUID)

                var guid = Guid.NewGuid().ToString().ToUpper().Substring(0, 4);

                rackCode = string.Format("{0}_{1}_{2}_{3}_{4}", wareHouseCode, floorCode, lineCode, "R", guid);
            }
            catch (Exception ex)
            {

                throw ex;
            }

            return rackCode;
        }

        [HttpGet]
        public string GenBoxCode(string wareHouseCode, string floorCode, string lineCode, string rackCode)
        {
            var boxCode = string.Empty;
            try
            {
                //Quy tắc sinh mã (MÃ KHO_MÃ TẦNG_MÃ DÃY_MÃ KỆ_BOX_GUID)

                var guid = Guid.NewGuid().ToString().ToUpper().Substring(0, 4);

                boxCode = string.Format("{0}_{1}_{2}_{3}_{4}_{5}", wareHouseCode, floorCode, lineCode, rackCode, "BOX", guid);
            }
            catch (Exception ex)
            {

                throw ex;
            }

            return boxCode;
        }

        [HttpGet]
        public string GenBookCode(string wareHouseCode, string floorCode, string lineCode, string rackCode, string boxCode)
        {
            var bookCode = string.Empty;
            try
            {
                //Quy tắc sinh mã (MÃ KHO_MÃ TẦNG_MÃ DÃY_MÃ KỆ_BOOK_GUID)

                var guid = Guid.NewGuid().ToString().ToUpper().Substring(0, 4);

                bookCode = string.Format("{0}_{1}_{2}_{3}_{4}_{5}_{6}", wareHouseCode, floorCode, lineCode, rackCode, boxCode, "BOOK", guid);
            }
            catch (Exception ex)
            {

                throw ex;
            }

            return bookCode;
        }

        [HttpGet]
        public object GetListObjByObjType(string objType)
        {
            var listObjCode = new List<DataObject>();
            try
            {
                switch (objType)
                {
                    case "OBJ_WAREHOUSE":
                        var listWareHouse = _context.EDMSWareHouses.Where(x => x.WHS_Flag != true && x.Type == "RV").ToList();
                        if (listWareHouse.Count > 0)
                        {
                            foreach (var item in listWareHouse)
                            {
                                var obj = new DataObject
                                {
                                    OBJ_Code = item.WHS_Code,
                                    OBJ_Name = item.WHS_Name
                                };

                                listObjCode.Add(obj);
                            }
                        }
                        break;
                    case "OBJ_FLOOR":
                        var listFloor = _context.EDMSFloors.ToList();
                        if (listFloor.Count > 0)
                        {
                            foreach (var item in listFloor)
                            {
                                var obj = new DataObject
                                {
                                    OBJ_Code = item.FloorCode,
                                    OBJ_Name = item.FloorName
                                };

                                listObjCode.Add(obj);
                            }
                        }
                        break;
                    case "OBJ_LINE":
                        var listLine = _context.EDMSLines.ToList();
                        if (listLine.Count > 0)
                        {
                            foreach (var item in listLine)
                            {
                                var obj = new DataObject
                                {
                                    OBJ_Code = item.LineCode,
                                    OBJ_Name = item.L_Text
                                };

                                listObjCode.Add(obj);
                            }
                        }
                        break;
                    case "OBJ_RACK":
                        var listRack = _context.EDMSRacks.ToList();
                        if (listRack.Count > 0)
                        {
                            foreach (var item in listRack)
                            {
                                var obj = new DataObject
                                {
                                    OBJ_Code = item.RackCode,
                                    OBJ_Name = item.RackName
                                };

                                listObjCode.Add(obj);
                            }
                        }
                        break;
                    case "OBJ_RACK_POSITION":
                        var listRackPosition = _context.EDMSRacks.ToList();
                        if (listRackPosition.Count > 0)
                        {
                            foreach (var item in listRackPosition)
                            {
                                var obj = new DataObject
                                {
                                    OBJ_Code = item.RackCode,
                                    OBJ_Name = item.RackName
                                };

                                listObjCode.Add(obj);
                            }
                        }
                        break;
                    case "OBJ_BOX":
                        var listBox = _context.EDMSBoxs.ToList();
                        if (listBox.Count > 0)
                        {
                            foreach (var item in listBox)
                            {
                                var obj = new DataObject
                                {
                                    OBJ_Code = item.BoxCode,
                                    OBJ_Name = item.NumBoxth
                                };

                                listObjCode.Add(obj);
                            }
                        }
                        break;
                    case "OBJ_BOOK":
                        var listBook = _context.EDMSBoxs.ToList();
                        if (listBook.Count > 0)
                        {
                            foreach (var item in listBook)
                            {
                                var obj = new DataObject
                                {
                                    OBJ_Code = item.BoxCode,
                                    OBJ_Name = item.NumBoxth
                                };

                                listObjCode.Add(obj);
                            }
                        }
                        break;
                    default:
                        break;
                }

                return Json(listObjCode);
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }

        [HttpPost]
        public object CreateQRCode([FromBody]EDMSWhsQrCode obj)
        {
            var msg = new JMessage();
            try
            {
                var qrCode = _context.EDMSWhsQrCodes.FirstOrDefault(x => x.QR_Code.Equals(obj.OBJ_Code));
                if (qrCode == null)
                {
                    var qrCodeObj = new EDMSWhsQrCode
                    {
                        OBJ_Code = obj.OBJ_Code,
                        OBJ_Type = obj.OBJ_Type,
                        QR_Code = obj.OBJ_Code,
                        PrintNumber = 0,
                        CreatedBy = User.Identity.Name,
                        CreatedTime = DateTime.Now,
                        Flag = true
                    };

                    _context.EDMSWhsQrCodes.Add(qrCodeObj);
                    _context.SaveChanges();
                    msg.Error = false;
                    msg.Title = "Tạo QRCode thành công";
                }
                else
                {
                    qrCode.OBJ_Code = obj.OBJ_Code;
                    qrCode.OBJ_Type = obj.OBJ_Type;
                    qrCode.QR_Code = obj.OBJ_Code;
                    qrCode.UpdatedTime = DateTime.Now;

                    _context.EDMSWhsQrCodes.Update(qrCode);
                    _context.SaveChanges();

                    msg.Error = false;
                    msg.Title = "Tạo QRCode thành công";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_ERR_ADD"));
            }
            return Json(msg);
        }

        [HttpPost]
        public object UpdateQRCode([FromBody]List<EDMSWhsQrCode> listQRCode)
        {
            var msg = new JMessage();
            try
            {
                foreach (var obj in listQRCode)
                {
                    obj.QR_Code = CommonUtil.GenerateQRCode(obj.QR_Code);
                }
                msg.Object = listQRCode;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_ERR_ADD"));
            }
            return Json(msg);
        }

        [HttpPost]
        public object UpdatePrint([FromBody]List<string> listPrint)
        {
            var msg = new JMessage();
            try
            {
                foreach (var objCode in listPrint)
                {
                    var qrCode = _context.EDMSWhsQrCodes.FirstOrDefault(x => x.OBJ_Code.Equals(objCode));
                    if (qrCode != null)
                    {
                        qrCode.PrintNumber = qrCode.PrintNumber + 1;
                        _context.EDMSWhsQrCodes.Update(qrCode);
                        _context.SaveChanges();
                    }
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_ERR_ADD"));
            }
            return Json(msg);
        }

        [HttpGet]
        public byte[] GenQRCode(string code)
        {
            try
            {
                return CommonUtil.GeneratorQRCode(code);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public string GenObjType(string objType)
        {
            var nameObjType = string.Empty;

            switch (objType)
            {
                case "OBJ_WAREHOUSE":
                    nameObjType = "Kho";
                    break;
                case "OBJ_FLOOR":
                    nameObjType = "Tầng";
                    break;
                case "OBJ_LINE":
                    nameObjType = "Dãy";
                    break;
                case "OBJ_RACK":
                    nameObjType = "Kệ";
                    break;
                case "OBJ_RACK_POSITION":
                    nameObjType = "Vị trí kệ";
                    break;
                case "OBJ_BOX":
                    nameObjType = "Thùng HSCT";
                    break;
                case "OBJ_BOOK":
                    nameObjType = "Cuốn HSCT";
                    break;
                default:
                    break;
            }

            return nameObjType;
        }

        //Lấy danh sách nhân viên
        [HttpGet]
        public object GetListUser()
        {
            var data = _context.Users.Where(x => x.Active == true).ToList();
            return Json(data);
        }
    }

    public class DataObject
    {
        public string OBJ_Code { get; set; }
        public string OBJ_Name { get; set; }
    }

    public class JTableQRCodeModel : JTableModel
    {
        public string FromDate { get; set; }
        public string ToDate { get; set; }
        public string ObjType { get; set; }
        public string CreatedBy { get; set; }
    }
}