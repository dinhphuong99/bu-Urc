using System;
using System.Collections.Generic;
using System.Data;
using System.Drawing;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using III.Domain.Enums;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using QRCoder;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class AssetAllocationController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IStringLocalizer<AssetAllocationController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IStringLocalizer<CustomerController> _stringLocalizerCus;
        private readonly IStringLocalizer<FileObjectShareController> _stringLocalizerFile;
        private readonly IStringLocalizer<ContractController> _contractController;
        private readonly IStringLocalizer<AssetInventoryController> _inventoryController;

        public AssetAllocationController(EIMDBContext context, IUploadService upload, IHostingEnvironment hostingEnvironment, IStringLocalizer<ContractController> contractController, IStringLocalizer<AssetInventoryController> inventoryController,
            IStringLocalizer<CustomerController> stringLocalizerCus, IStringLocalizer<FileObjectShareController> stringLocalizerFile, IStringLocalizer<AssetAllocationController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _hostingEnvironment = hostingEnvironment;
            _upload = upload;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
            _stringLocalizerCus = stringLocalizerCus;
            _stringLocalizerFile = stringLocalizerFile;
            _contractController = contractController;
            _inventoryController = inventoryController;
        }
        public IActionResult Index()
        {
            return View();
        }

        #region Index

        [HttpPost]
        public object JTableAssetAllocation([FromBody]JTableModelAssetTicket jPara)
        {
            var fromDate = !string.IsNullOrEmpty(jPara.FromDate) ? DateTime.ParseExact(jPara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jPara.ToDate) ? DateTime.ParseExact(jPara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var allocateTime = !string.IsNullOrEmpty(jPara.AllocateTime) ? DateTime.ParseExact(jPara.AllocateTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            int intBeginFor = (jPara.CurrentPage - 1) * jPara.Length;
            var query = from a in _context.AssetAllocateHeaders
                        join b in _context.AdGroupUsers on a.DepartmentSend equals b.GroupUserCode into b1
                        from b2 in b1.DefaultIfEmpty()
                        join c in _context.HREmployees on a.UserReceiver equals c.Id.ToString() into c1
                        from c2 in c1.DefaultIfEmpty()
                        join d in _context.CommonSettings on a.Status equals d.CodeSet into d1
                        from d2 in d1.DefaultIfEmpty()
                        join e in _context.HREmployees on a.UserAllocate equals e.Id.ToString() into e1
                        from e2 in e1.DefaultIfEmpty()
                        join f in _context.AdGroupUsers on a.DepartmentReceive equals f.GroupUserCode into f1
                        from f2 in f1.DefaultIfEmpty()
                        where a.IsDeleted == false
                        && ((string.IsNullOrEmpty(jPara.Title) || a.Note.ToLower().Contains(jPara.Title.ToLower()))
                        || (string.IsNullOrEmpty(jPara.Title) || a.Title.ToLower().Contains(jPara.Title.ToLower())))
                        && (string.IsNullOrEmpty(jPara.DepartmentSend) || a.DepartmentSend.ToLower().Equals(jPara.DepartmentSend.ToLower()))
                        && (string.IsNullOrEmpty(jPara.UserAllocate) || a.UserAllocate.Equals(jPara.UserAllocate))
                        && (string.IsNullOrEmpty(jPara.DepartmentReceive) || a.DepartmentReceive.ToLower().Equals(jPara.DepartmentReceive.ToLower()))
                        && (string.IsNullOrEmpty(jPara.UserReceiver) || a.UserReceiver.ToLower().Equals(jPara.UserReceiver.ToLower()))
                        && (string.IsNullOrEmpty(jPara.TicketCode) || a.TicketCode.ToLower().Contains(jPara.TicketCode.ToLower()))
                        && (fromDate == null || (a.AllocateTime <= toDate))
                        && (toDate == null || (a.AllocateTime >= fromDate))
                        select new
                        {
                            a.ID,
                            a.TicketCode,
                            a.Title,
                            DepartmentSend = b2.Title,
                            UserAllocate = e2.fullname,
                            a.LocationSend,
                            DepartmentReceive = f2.Title,
                            UserReceiver = c2.fullname,
                            Status = d2.ValueSet,
                            a.AllocateTime,

                        };
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jPara.QueryOrderBy).Skip(intBeginFor).Take(jPara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jPara.Draw, count, "ID", "TicketCode", "Title", "DepartmentSend", "LocationSend", "UserAllocate", "DepartmentReceive", "UserReceiver", "Status", "AllocateTime");
            return Json(jdata);
        }

        [HttpPost]

        public object JTableAssetAlloccate([FromBody]JTableAllocatedAsset jParams)
        {
            int intBeginFor = (jParams.CurrentPage - 1) * jParams.Length;
            var query = from a in _context.AssetAllocateDetails
                        join b in _context.AssetMains on a.AssetCode equals b.AssetCode into c
                        from d in c.DefaultIfEmpty()
                        where (a.IsDeleted == false)
                        select new
                        {
                            a.ID,
                            a.AssetCode,
                            a.Quantity,
                            a.ListImages,
                            a.CostValue,
                            a.Note,
                            Status = d.Status,
                            AssetName = d.AssetName
                        };

            //var query = from a in _context.MainAssets
            //            join b in _context.AssetAllocateDetails on a.AssetCode equals b.AssetCode into c
            //            from d in c.DefaultIfEmpty()
            //            select new
            //            {

            //            };

            var count = query.Count();
            var data = query.OrderUsingSortExpression(jParams.QueryOrderBy).Skip(intBeginFor).Take(jParams.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jParams.Draw, count, "ID", "AssetCode", "Quantity", "ListImages", "CostValue", "Note", "Status", "Status", "CreatedTime", "AssetName");
            return Json(jdata);
        }

        [HttpPost]
        public JsonResult Insert([FromBody]AssetAllocateRes obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            String actCode = EnumHelper<LogActivity>.GetDisplayValue(LogActivity.ActivityCreate);
            try
            {
                var check = _context.AssetAllocateHeaders.FirstOrDefault(x => x.TicketCode.Equals(obj.TicketCode));
                if (check == null)
                {
                    DateTime? allocateTime = !string.IsNullOrEmpty(obj.AllocateTime) ? DateTime.ParseExact(obj.AllocateTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

                    var assetAllocate = new AssetAllocateHeader();
                    assetAllocate.TicketCode = obj.TicketCode;
                    assetAllocate.Title = obj.Title;
                    assetAllocate.DepartmentSend = obj.DepartmentSend;
                    assetAllocate.UserAllocate = obj.UserAllocate;
                    assetAllocate.AllocateTime = allocateTime;
                    assetAllocate.DepartmentReceive = obj.DepartmentReceive;
                    assetAllocate.LocationSend = obj.LocationSend;
                    assetAllocate.UserReceiver = obj.UserReceiver;
                    assetAllocate.ObjActCode = obj.ObjActCode;
                    obj.Status = "ASSET_CREATE";
                    assetAllocate.Status = obj.Status;
                    assetAllocate.Note = obj.Note;
                    assetAllocate.CreatedTime = DateTime.Now;
                    assetAllocate.CreatedBy = ESEIM.AppContext.UserName;
                    //Insert auto log
                    InsertLogDataAuto(actCode, assetAllocate);
                    _context.AssetAllocateHeaders.Add(assetAllocate);

                    var listUser = from a in _context.WorkflowActivityRoles.Where(x => !x.IsDeleted && x.WorkFlowCode == assetAllocate.ObjActCode)
                                   join b in _context.Roles on a.Role equals b.Code
                                   join c in _context.UserRoles on b.Id equals c.RoleId
                                   select new
                                   {
                                       c.UserId
                                   };
                    foreach (var item in listUser)
                    {
                        var notification = new NotificationObject
                        {
                            ObjType = "ASSET_ALLOCATE",
                            ObjCode = assetAllocate.TicketCode,
                            IsViewed = false,
                            CreatedBy = ESEIM.AppContext.UserName,
                            CreatedTime = DateTime.Now,
                            ListUser = item.UserId
                        };
                        _context.NotificationObjects.Add(notification);
                    }

                    _context.SaveChanges();
                    // msg.Title = "Thêm phiếu cấp phát tài sản thành công";
                    msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer["ASSET_ALLO_LBL_TICKET"]);

                    msg.ID = assetAllocate.ID;
                }
                else
                {
                    msg.Error = true;
                    // msg.Title = "Mã phiếu cấp phát tài sản đã tồn tại";
                    msg.Title = String.Format(_sharedResources["COM_MSG_EXITS"], _stringLocalizer["ASSET_ALLO_LBL_TICKET"]);

                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                // msg.Title = "Có lỗi xảy ra";
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }

            return Json(msg);
        }

        [HttpPost]
        public JsonResult Update([FromBody] AssetAllocateRes obj)
        {
            var msg = new JMessage { Title = "", Error = false };
            string actCode = EnumHelper<LogActivity>.GetDisplayValue(LogActivity.ActivityUpdate);
            try
            {
                var checkId = _context.AssetAllocateHeaders.FirstOrDefault(x => !x.IsDeleted && x.ID == obj.ID);
                if (checkId != null)
                {
                    var data = _context.AssetAllocateHeaders.FirstOrDefault(x => x.TicketCode == obj.TicketCode && x.IsDeleted == false);
                    if (data != null)
                    {
                        data.Title = obj.Title;
                        data.ObjActCode = obj.ObjActCode;
                        data.DepartmentSend = obj.DepartmentSend;
                        data.UserAllocate = obj.UserAllocate;
                        data.DepartmentReceive = obj.DepartmentReceive;
                        data.UserReceiver = obj.UserReceiver;
                        data.Note = obj.Note;
                        data.LocationSend = obj.LocationSend;
                        obj.Status = "ASSET_EDIT";
                        data.Status = obj.Status;
                        data.UpdateBy = ESEIM.AppContext.UserName;
                        data.UpdateTime = DateTime.Now;
                        InsertLogDataAuto(actCode, data);
                        _context.AssetAllocateHeaders.Update(data);
                        _context.SaveChanges();
                        //msg.Title = "Cập nhật phiếu cấp phát tài sản thành công";
                        msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizer["ASSET_ALLO_MSG_TICKET"]);

                    }
                    else
                    {
                        msg.Error = true;
                        // msg.Title = "Phiếu cấp phát tài sản không tồn tại";
                        msg.Title = String.Format(_sharedResources["COM_MSG_NOT_EXITS"], _stringLocalizer["ASSET_ALLO_MSG_TICKET"]);

                    }
                }
                else
                {
                    msg.Error = true;
                    // msg.Title = "Phiếu cấp phát tài sản không tồn tại";
                    msg.Title = String.Format(_sharedResources["COM_MSG_NOT_EXITS"], _stringLocalizer["ASSET_ALLO_MSG_TICKET"]);

                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                // msg.Title = "Có lỗi xảy ra";
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpGet]
        public JsonResult GetActivityStatus(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.AssetAllocateHeaders.FirstOrDefault(x => x.ID == id);
                if (data != null)
                {
                    msg.Object = data.ListStatus.Where(x => x.Type != null && x.Type.Equals(EnumHelper<TypeLogStatus>.GetDisplayValue(TypeLogStatus.StatusReceipt))).Select(x => new
                    {
                        Status = !string.IsNullOrEmpty(x.Status) ? _context.CommonSettings.FirstOrDefault(p => !p.IsDeleted && p.CodeSet.Equals(x.Status))?.ValueSet : "",
                        CreatedBy = _context.Users.FirstOrDefault(y => y.UserName == x.CreatedBy).GivenName ?? "",
                        x.Reason,
                        x.CreatedTime
                    });
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                // msg.Title = "Có lỗi xin thử lại!";
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public object GetDepartment()
        {
            var data = _context.AdGroupUsers.Select(x => new { Code = x.GroupUserCode, Name = x.Title }).ToList();
            return data;
        }

        [HttpPost]
        public object GetUser(string unit)
        {
            if (!string.IsNullOrEmpty(unit))
            {
                var data = _context.HREmployees.Where(x => x.flag.Value == 1 && x.unit == unit).Select(x => new { Code = x.Id.ToString(), Name = x.fullname }).ToList();
                return data;
            }
            else
            {
                var data = _context.HREmployees.Where(x => x.flag.Value == 1).Select(x => new { Code = x.Id.ToString(), Name = x.fullname }).ToList();
                return data;
            }
        }

        [HttpPost]
        public JsonResult GenTicketCode()
        {
            var monthNow = DateTime.Now.Month;
            var yearNow = DateTime.Now.Year;
            var reqCode = string.Empty;
            var no = 1;
            var noText = "01";
            var data = _context.AssetAllocateHeaders.Where(x => x.CreatedTime.Value.Year == yearNow && x.CreatedTime.Value.Month == monthNow).ToList();
            if (data.Count > 0)
            {
                no = data.Count + 1;
                if (no < 10)
                {
                    noText = "0" + no;
                }
                else
                {
                    noText = no.ToString();
                }
            }

            reqCode = string.Format("{0}{1}{2}{3}", "AST_", "T" + monthNow + ".", yearNow + "_", noText);

            return Json(reqCode);
        }

        [HttpPost]
        public object UploadImage(IFormFile fileUpload)
        {
            var msg = new JMessage();
            try
            {
                var upload = _upload.UploadImage(fileUpload);
                msg.Error = false;
                msg.Title = "";
                msg.Object = upload.Object;
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                // msg.Title = "Có lỗi xảy ra khi upload file!";
                msg.Title = _sharedResources["COM_MSG_ERR"];

                msg.Object = ex;
                return Json(msg);
            }
        }
        [HttpPost]
        public object GetStatus()
        {
            var data = _context.CommonSettings.Where(x => x.Group == "ASSET_URENCO").OrderBy(x => x.Priority).Select(x => new { Code = x.CodeSet, Name = x.ValueSet, Icon = x.Logo }).ToList();
            return data;
        }

        [HttpPost]
        public object GetStatusAsset()
        {
            var data = _context.CommonSettings.Where(x => x.Group == "SERVICE_STATUS").Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return data;
        }
        [HttpPost]
        public JsonResult InsertAsset([FromBody]AssetAllocateDetailRes obj)
        {
            var msg = new JMessage { Error = false };
            try
            {
                var checkExists = _context.AssetAllocateHeaders.FirstOrDefault(x => x.TicketCode.Equals(obj.TicketCode) && !x.IsDeleted);
                if (checkExists == null)
                {
                    msg.Error = true;
                    // msg.Title = "Vui lòng bấm lưu trước khi thêm tài sản";
                    msg.Title = _stringLocalizer["ASSET_ALLO_VALIDATE_TXT_ADD_ASSET"];

                }
                else
                {
                    var checkQuantity = int.Parse(obj.Quantity);
                    if (checkQuantity > 0)
                    {
                        var data = _context.AssetAllocateDetails.FirstOrDefault(x => x.AssetCode.Equals(obj.AssetCode) && !x.IsDeleted && x.TicketCode.Equals(obj.TicketCode));
                        if (data == null)
                        {
                            var allocateDetail = new AssetAllocateDetail()
                            {
                                AssetCode = obj.AssetCode,
                                Quantity = int.Parse(obj.Quantity),
                                Status = obj.Status,
                                Note = obj.Note,
                                TicketCode = obj.TicketCode,
                                CreatedBy = ESEIM.AppContext.UserName,
                                CreatedTime = DateTime.Now,
                            };
                            _context.AssetAllocateDetails.Add(allocateDetail);
                            _context.SaveChanges();
                            msg.Error = false;
                            //msg.Title = "Thêm tài sản thành công";
                            msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer["ASSET_ALLO_LBL_ASSET"]);

                        }
                        else
                        {
                            msg.Error = true;
                            // msg.Title = "Tài sản đã tồn tại trong phiếu";
                            msg.Title = String.Format(_sharedResources["COM_MSG_EXITS"], _stringLocalizer["ASSET_ALLO_LBL_ASSET"]);

                        }
                    }
                    else
                    {
                        msg.Error = true;
                        // msg.Title = "Số lượng nhập phải lớn hơn 0";
                        msg.Title = _stringLocalizer["ASSET_ALLO_VALIDATE_LBL_QUANTITY"];
                    }
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                // msg.Title = "Có lỗi xảy ra";
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }

            return Json(msg);
        }

        [HttpPost]
        public object GetAssset()
        {
            var data = _context.AssetMains.Select(x => new { Code = x.AssetCode, Name = x.AssetName, AssetStatus = x.Status }).ToList();
            return data;
        }

        [HttpGet]
        public object GetItem(int Id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            var data = _context.AssetAllocateHeaders.FirstOrDefault(x => x.ID == Id);
            if (data != null)
            {
                data.sAllocateTime = data.AllocateTime.HasValue ? data.AllocateTime.Value.ToString("dd/MM/yyyy") : null;
            }
            msg.Object = data;

            return Json(msg);
        }

        [HttpPost]
        public JsonResult DeleteTicket(int id)
        {
            var msg = new JMessage() { Error = false };
            var actCode = EnumHelper<LogActivity>.GetDisplayValue(LogActivity.ActivityDelete);
            try
            {
                var data = _context.AssetAllocateHeaders.FirstOrDefault(x => !x.IsDeleted && x.ID == id);
                var status = data.Status;
                if (data != null)
                {
                    data.DeletedBy = ESEIM.AppContext.UserName;
                    data.DeletedTime = DateTime.Now;
                    data.IsDeleted = true;
                    _context.AssetAllocateHeaders.Update(data);
                    InsertLogDataAuto(actCode, data);
                    _context.SaveChanges();
                    // msg.Title = "Xóa thành công";
                    msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizer["ASSET_ALLO_LBL_TICKET"]);

                }
                else
                {
                    msg.Error = true;
                    //msg.Title = "Không tồn tại phiếu";
                    msg.Title = String.Format(_sharedResources["COM_MSG_NOT_EXITS"], _stringLocalizer["ASSET_ALLO_LBL_TICKET"]);

                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = "Có lỗi xảy ra";
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult DeleteAssetAllocated(int id)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var data = _context.AssetAllocateDetails.FirstOrDefault(x => !x.IsDeleted && x.ID == id);
                var status = data.Status;
                if (data != null)
                {
                    data.DeletedBy = ESEIM.AppContext.UserName;
                    data.DeletedTime = DateTime.Now;
                    data.IsDeleted = true;
                    _context.AssetAllocateDetails.Update(data);
                    _context.SaveChanges();

                    //msg.Title = "Xóa thành công";
                    msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizer["ASSET_ALLO_LBL_ASSET"]);

                }
                else
                {
                    msg.Error = true;
                    // msg.Title = "Không tồn tại phiếu";
                    msg.Title = String.Format(_sharedResources["COM_MSG_NOT_EXITS"], _stringLocalizer["ASSET_ALLO_LBL_ASSET"]);

                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                // msg.Title = "Có lỗi xảy ra";
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public object JTableAssetDetail([FromBody]JAssetDetail jTablePara)
        {
            var allocateTime = !string.IsNullOrEmpty(jTablePara.AllocateTime) ? DateTime.ParseExact(jTablePara.AllocateTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.AssetAllocateDetails
                        join b in _context.AssetAllocateHeaders on a.TicketCode equals b.TicketCode into c
                        from c1 in c.DefaultIfEmpty()
                        join g in _context.AdGroupUsers on c1.DepartmentReceive equals g.GroupUserCode into g1
                        from g2 in g1.DefaultIfEmpty()
                        join d in _context.AssetMains on a.AssetCode equals d.AssetCode into f
                        from f1 in f.DefaultIfEmpty()
                        where (!a.IsDeleted && a.TicketCode.Equals(jTablePara.TicketCode))
                        select new
                        {
                            a.ID,
                            a.AssetCode,
                            AssetName = f1.AssetName,
                            DepartmentReceive = g2.Title,
                            AllocateTime = allocateTime,
                            UserReceive = c1.UserReceiver,
                            a.Quantity,
                            LocationSend = c1.LocationSend
                        };
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "ID", "AssetCode", "AssetName", "DepartmentReceive", "AllocateTime", "UserReceive", "Quantity", "LocationSend");
            return Json(jdata);
        }

        [HttpGet]
        public JsonResult CheckFileExits(string fileCode)
        {
            var msg = new JMessage() { Error = false };
            var file = _context.EDMSFiles.FirstOrDefault(x => x.FileCode == fileCode && !x.IsDeleted);
            if (file == null)
            {
                msg.Error = true;
                //msg.Title = "File chưa tồn tại. Vui lòng bấm lưu lại!";
                msg.Title = _stringLocalizer["ASSET_ALLO_VALIDATE_LBL_FILE"];
            }

            return Json(msg);
        }

        [HttpPost]
        [RequestFormLimits(MultipartBodyLengthLimit = long.MaxValue)]
        [RequestSizeLimit(long.MaxValue)]
        public JsonResult UploadFile(AssetAllocationFile obj, IFormFile fileUpload)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var upload = _upload.UploadFile(fileUpload, Path.Combine(_hostingEnvironment.WebRootPath, "uploads\\files"));
                if (upload.Error)
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["ASSET_ALLO_UP_FILE_FAILED"];
                }
                else
                {
                    var file = new AssetAllocationFile
                    {
                        FileName = obj.FileName,
                        FileCode = obj.FileCode,
                        TicketCode = obj.TicketCode,
                    };
                    var file2 = new EDMSFile()
                    {
                        FileName = obj.FileName,
                        FileCode = obj.FileCode,
                        FileTypePhysic = Path.GetExtension(fileUpload.FileName),
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now,
                        Url = "/uploads/files/" + upload.Object.ToString(),

                    };
                    _context.AssetAllocationFiles.Add(file);
                    _context.EDMSFiles.Add(file2);
                    _context.SaveChanges();
                    msg.Title = _stringLocalizer["ASSET_ALLO_UP_FILE_OK"];
                }
            }
            catch (Exception ex)
            {
                msg.Title = _sharedResources["COM_MSG_ERR"];
                msg.Error = true;
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult GenFileCode()
        {
            var monthNow = DateTime.Now.Month;
            var yearNow = DateTime.Now.Year;
            var reqCode = string.Empty;
            var no = 1;
            var noText = "01";
            var data = _context.EDMSFiles.Where(x => x.CreatedTime.Value.Year == yearNow && x.CreatedTime.Value.Month == monthNow).ToList();
            if (data.Count > 0)
            {
                no = data.Count + 1;
                if (no < 10)
                {
                    noText = "0" + no;
                }
                else
                {
                    noText = no.ToString();
                }
            }

            reqCode = string.Format("{0}{1}{2}{3}", "F_CODE_", "T" + monthNow + ".", yearNow + "_", noText);

            return Json(reqCode);
        }

        [HttpPost]
        public object GetListFile(string code)
        {
            var data = from a in _context.AssetAllocationFiles
                       join b in _context.EDMSFiles on a.FileCode equals b.FileCode into b1
                       from c in b1.DefaultIfEmpty()
                       where (!c.IsDeleted && a.TicketCode.Equals(code))
                       select new
                       {
                           Id = a.Id,
                           Name = c.FileName,
                           Code = c.FileCode
                       };
            return data;
        }

        [HttpPost]
        public async Task<JsonResult> DeleteFile(int id)
        {
            var mess = new JMessage { Error = false, Title = "" };
            try
            {
                var file = await _context.AssetAllocationFiles.FirstOrDefaultAsync(x => x.Id == id);
                var edmsFile = _context.EDMSFiles.FirstOrDefault(x => x.FileCode.Equals(file.FileCode));
                //edmsFile.IsDeleted = true;
                _context.AssetAllocationFiles.Remove(file);
                _context.EDMSFiles.Remove(edmsFile);
                _context.SaveChanges();
                mess.Title = _stringLocalizer["ASSET_ALLO_UP_FILE_OK"];
            }
            catch (Exception ex)
            {
                mess.Title = _sharedResources["COM_MSG_ERR"];
                mess.Error = true;
            }
            return Json(mess);
        }
        #endregion

        #region Activity

        [HttpPost]
        public object InsertLogData([FromBody]ActivityLogDataRes obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            var data = _context.CatActivitys.Where(x => x.ActCode.Equals(obj.ActCode)).Select(y => y.ActType).ToList();
            string actType = "";
            foreach (var item in data)
            {
                actType = item;
            }
            try
            {
                DateTime? actTime = !string.IsNullOrEmpty(obj.ActTime) ? DateTime.ParseExact(obj.ActTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                if (obj.ObjActCode != null && obj.ObjCode != null)
                {
                    List<string> list = new List<string>();
                    var activityLogData = new ActivityLogData
                    {
                        ActCode = obj.ActCode,
                        WorkFlowCode = obj.ObjActCode,
                        ObjCode = obj.ObjCode,
                        ActTime = actTime,
                        ActType = actType,
                        ActLocationGPS = obj.ActLocationGPS, // Chưa biết cách lấy
                        ActFromDevice = obj.ActFromDevice,    // Chưa biết cách lấy
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now
                    };
                    _context.ActivityLogDatas.Add(activityLogData);
                    _context.SaveChanges();
                    // msg.Title = "Hoạt động đã lưu vào log";
                    msg.Title = _stringLocalizer["ASSET_ALLO_VALIDATE_INSET_LOG"];
                }
                else
                {
                    msg.Error = true;
                    // msg.Title = "Vui lòng nhập đầy đủ thông tin";
                    msg.Title = _stringLocalizer["COM_MSG_INFOMATION"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                // msg.Title = "Có lỗi xảy ra";
                msg.Title = _sharedResources["COM_MSG_ERR"];

            }
            return Json(msg);
        }

        [HttpGet]
        public object GetCatActivity()
        {
            var data = _context.CatActivitys.Where(x => x.IsDeleted == false)
                .Select(x => new { Code = x.ActCode, Name = x.ActName, Group = x.ActGroup, Type = x.ActType }).ToList();
            return data;
        }

        [HttpGet]
        public object GetCatActivityWorkFlow(string wfCode)
        {
            var session = HttpContext.GetSessionUser();
            var data = (from a in _context.CatActivitys.Where(x => !x.IsDeleted)
                        join b in _context.WorkflowActivityRoles.Where(x => !x.IsDeleted && x.WorkFlowCode == wfCode
                        && x.BranchCode == session.BranchId && x.Role == session.RoleCode
                        && session.ListDepartment.Any(k => k == x.DepartCode)) on a.ActCode equals b.ActCode
                        join c in _context.ObjectActivitys.Where(x => !x.IsDeleted) on new { b.WorkFlowCode, b.ActCode } equals new { c.WorkFlowCode, c.ActCode }
                        select new
                        {
                            Code = a.ActCode,
                            Name = a.ActName,
                            Group = a.ActGroup,
                            Type = a.ActType,
                            c.Priority
                        }).DistinctBy(x => x.Code).OrderBy(x => x.Priority);
            return data;
        }

        [HttpPost]
        public object GetItemAttrSetup([FromBody]ModelWorkFolwRole obj)
        {
            var session = HttpContext.GetSessionUser();
            var getdata = _context.WorkflowActivityRoles.Where(x => !x.IsDeleted && x.WorkFlowCode == obj.WorkFlowCode
                        && x.ActCode == obj.ActCode && x.Role == session.RoleCode).Select(x => new { x.WorkFlowProperty }).ToList();

            //var data = (from a in _context.ActivityAttrSetups
            //            join b in _context.CommonSettings on a.AttrDataType equals b.CodeSet into b1
            //            from b2 in b1.DefaultIfEmpty()
            //            join c in _context.CommonSettings on a.AttrUnit equals c.CodeSet into c1
            //            from c2 in c1.DefaultIfEmpty()
            //            where (a.IsDeleted == false && getdata.Any(p => p.WorkFlowProperty.Equals(a.AttrCode)))
            //            select new
            //            {
            //                Id = a.ID,
            //                Code = a.AttrCode,
            //                Name = a.AttrName,
            //                UnitCode = a.AttrUnit,
            //                Unit = c2.ValueSet,
            //                DataTypeCode = a.AttrDataType,
            //                DataType = b2.ValueSet,
            //                Group = a.AttrGroup,
            //            }).ToList();

            var data = (from a in _context.ObjectActivitys
                        join b in _context.WorkflowActivityRoles.Where(x => !x.IsDeleted && x.WorkFlowCode == obj.WorkFlowCode
                        && x.ActCode == obj.ActCode && x.Role == session.RoleCode) on new { a.WorkFlowCode, a.ActCode } equals new { b.WorkFlowCode, b.ActCode }
                        where (a.IsDeleted == false && a.WorkFlowCode == obj.WorkFlowCode && a.ActCode == obj.ActCode)
                        select new
                        {
                            Code = b.WorkFlowProperty,
                            Name = b.WorkFlowProperty != null ? (_context.ActivityAttrSetups.FirstOrDefault(x => x.AttrCode == b.WorkFlowProperty).AttrName != null ? _context.ActivityAttrSetups.FirstOrDefault(x => x.AttrCode == b.WorkFlowProperty).AttrName : "") : "",
                            UnitCode = a.UnitTime,
                            DataTypeCode = "",
                        }).ToList();
            return data;
        }

        [HttpPost]
        public object GetCatObjActivity()
        {
            var check = (from a in _context.AssetAllocateHeaders
                         join b in _context.CatWorkFlows on a.ObjActCode equals b.WorkFlowCode
                         select new
                         {
                             Code = a.ObjActCode,
                             CatName = b.Name
                         }).Distinct().ToList();

            if (check.Count > 0)
            {
                return check;
            }
            else
            {
                var data = _context.CatWorkFlows.Where(x => x.IsDeleted == false).OrderBy(x => x.Name).ThenBy(x => x.WorkFlowCode).Select(x => new { Code = x.WorkFlowCode, CatName = x.Name }).ToList();
                return data;
            }
        }

        [HttpPost]
        public object InsertAttrData([FromBody]ActivityAttrData obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var checkStatus = _context.ActivityAttrDatas.FirstOrDefault(x => x.IsDeleted == false && x.WorkFlowCode.Equals(obj.WorkFlowCode) && x.ObjCode.Equals(obj.ObjCode) && x.Status == "STATUS_EDIT_ACT");
                if (checkStatus == null)
                {
                    var check = _context.ActivityAttrDatas.FirstOrDefault(x => x.IsDeleted == false && x.WorkFlowCode.Equals(obj.WorkFlowCode) && x.ObjCode.Equals(obj.ObjCode) && x.ActCode.Equals(obj.ActCode) && x.AttrCode.Equals(obj.AttrCode));
                    if (check == null && obj.WorkFlowCode != null && obj.ObjCode != null && obj.ActCode != null)
                    {
                        var actAttrData = new ActivityAttrData()
                        {
                            AttrCode = obj.AttrCode,
                            ObjCode = obj.ObjCode,
                            WorkFlowCode = obj.WorkFlowCode,
                            ActCode = obj.ActCode,
                            Value = obj.Value,
                            Note = obj.Note,
                            Status = "STATUS_EDIT_ACT",
                            CreatedBy = ESEIM.AppContext.UserName,
                            CreatedTime = DateTime.Now
                        };
                        _context.ActivityAttrDatas.Add(actAttrData);
                        _context.SaveChanges();
                        //msg.Title = "Thêm thuộc tính thành công";
                        msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer["ASSET_ALLO_LBL_ATTR"]);

                    }
                    else
                    {
                        msg.Error = true;
                        //msg.Title = "Có lỗi xảy ra";
                        msg.Title = _sharedResources["COM_MSG_ERR"];
                    }
                }
                else
                {
                    msg.Error = true;
                    //msg.Title = "Có lỗi xảy ra";
                    msg.Title = _sharedResources["ASSET_INVENTORY_MSG_ERR_CHANGE_STATUS"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                // msg.Title = "Có lỗi xảy ra";
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public object GetListActivityAttrData(string objCode, string actCode, string objActCode)
        {
            var data = from a in _context.ActivityAttrDatas
                       join b in _context.ActivityAttrSetups on a.AttrCode equals b.AttrCode
                       join c in _context.CommonSettings on b.AttrUnit equals c.CodeSet
                       join d in _context.CommonSettings on b.AttrDataType equals d.CodeSet
                       where (a.IsDeleted == false && a.ObjCode.Equals(objCode) && a.WorkFlowCode.Equals(objActCode) && a.ActCode.Equals(actCode))
                       select new
                       {
                           Id = a.ID,
                           Name = b.AttrName,
                           sValue = a.Value,
                           Unit = c.ValueSet,
                           DataType = d.ValueSet,
                           Group = b.AttrGroup,
                           sNote = a.Note
                       };
            return data;
        }

        [HttpPost]
        public JsonResult DeleteAttrData(int id)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            var data = _context.ActivityAttrDatas.FirstOrDefault(x => x.ID == id && !x.IsDeleted);
            if (data != null)
            {
                data.IsDeleted = true;
                data.DeletedBy = ESEIM.AppContext.UserName;
                data.DeletedTime = DateTime.Now;
                _context.ActivityAttrDatas.Update(data);
                _context.SaveChanges();
                //msg.Title = " Xóa thành công";
                msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizer["ASSET_ALLO_LBL_ATTR"]);

            }
            else
            {
                msg.Error = true;
                //msg.Title = "Không tìm thấy phần tử cần xóa";
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public object JTableActivity([FromBody]JTableActivityModel jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = (from a in _context.ActivityLogDatas
                         join b in _context.ActivityAttrDatas.Where(x => !x.IsDeleted) on new { a.ActCode, a.WorkFlowCode, a.ObjCode } equals new { b.ActCode, b.WorkFlowCode, b.ObjCode }
                         join c in _context.CatActivitys.Where(x => !x.IsDeleted) on a.ActCode equals c.ActCode
                         join d in _context.ActivityAttrSetups.Where(x => !x.IsDeleted) on b.AttrCode equals d.AttrCode
                         join e in _context.CommonSettings.Where(x => !x.IsDeleted) on c.ActType equals e.CodeSet into e1
                         from e2 in e1.DefaultIfEmpty()
                         join f in _context.CommonSettings.Where(x => !x.IsDeleted) on d.AttrUnit equals f.CodeSet into f1
                         from f2 in f1.DefaultIfEmpty()
                         where (a.IsDeleted == false && a.ObjCode.Equals(jTablePara.TicketCode) && a.WorkFlowCode.Equals(jTablePara.ObjActCode))
                         select new
                         {
                             a.ID,
                             ActName = c.ActName,
                             ActCode = c.ActCode,
                             ActType = e2.ValueSet,
                             UserAct = b.CreatedBy,
                             AttrCode = b.AttrCode,
                             Time = b.CreatedTime != null ? b.CreatedTime.Value.ToString("dd/MM/yyyy hh:mm:ss") : "",
                             CreatedTime = b.CreatedTime.Value,
                             Result = "-" + _stringLocalizer["ASSET_ALLO_LBL_ATTR"] + ": " + d.AttrName + " <br />" + "-"
                             + _stringLocalizer["ASSET_ALLO_LBL_VL"] + ": " + b.Value + "<br/>" + " -"
                             + _stringLocalizer["ASSET_ALLO_LBL_UNIT"] + ": " + f2.ValueSet
                         }).DistinctBy(x => new { x.ActCode, x.ActType, x.AttrCode }).OrderByDescending(x => x.UserAct).ThenByDescending(x => x.CreatedTime);
            var count = query.Count();
            var data = query.Skip(intBeginFor).Take(jTablePara.Length).ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "ID", "ActName", "ActType", "UserAct", "Result", "Time");
            return Json(jdata);
        }

        [HttpPost]
        public JsonResult DeleteItemActivity(int id)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            var data = _context.ActivityLogDatas.FirstOrDefault(x => x.ID == id && !x.IsDeleted);
            if (data != null && ESEIM.AppContext.UserName.Equals(data.CreatedBy))
            {
                data.IsDeleted = true;
                data.DeletedBy = ESEIM.AppContext.UserName;
                data.DeletedTime = DateTime.Now;
                _context.ActivityLogDatas.Update(data);
                _context.SaveChanges();
                //  msg.Title = " Xóa thành công";
                msg.Title = _sharedResources["COM_MSG_DELETE_SUCCESS"];
            }
            else
            {
                msg.Error = true;
                //  msg.Title = "Xóa thất bại";
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        public void InsertLogDataAuto(string actCode, AssetAllocateHeader obj)
        {
            var data = _context.ActivityLogDatas.FirstOrDefault(x => !x.IsDeleted && x.WorkFlowCode.Equals(obj.ObjActCode) && x.ActCode.Equals(actCode) && x.ObjCode.Equals(obj.TicketCode));
            if (data == null)
            {
                data = new ActivityLogData();
                data.ListLog = new List<string>();
                data.ActCode = actCode;
                data.ActType = "ACTIVITY_AUTO_LOG";
                data.WorkFlowCode = obj.ObjActCode;
                data.ObjCode = obj.TicketCode;
                data.ActTime = DateTime.Now;
                data.CreatedBy = ESEIM.AppContext.UserName;
                data.CreatedTime = DateTime.Now;
                string jObj = JsonConvert.SerializeObject(obj);
                data.ListLog.Add(jObj);
                data.Log = JsonConvert.SerializeObject(data.ListLog);
                _context.ActivityLogDatas.Add(data);
            }
            else
            {
                string jObj = JsonConvert.SerializeObject(obj);
                data.ListLog.Add(jObj);
                data.Log = JsonConvert.SerializeObject(data.ListLog);
                _context.ActivityLogDatas.Update(data);
            }

        }

        [HttpPost]
        public object CheckRoleUser(string wfCode)
        {
            var session = HttpContext.GetSessionUser();
            var data = _context.WorkflowActivityRoles.Where(x => !x.IsDeleted && x.WorkFlowCode == wfCode
            && x.Role == session.RoleCode && x.BranchCode == session.BranchId && session.ListDepartment.Any(k => k == x.DepartCode));
            if (data != null)
            {
                return true;
            }
            else
            {
                return false;
            }
        }
        #endregion

        #region File
        public class JTableModelFile : JTableModel
        {
            public string AssetCode { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string CatCode { get; set; }
            public int? FileID { get; set; }
        }

        [HttpPost]
        public object JTableFile([FromBody]JTableModelFile jTablePara)
        {
            if (string.IsNullOrEmpty(jTablePara.AssetCode))
            {
                return JTableHelper.JObjectTable(new List<object>(), jTablePara.Draw, 0, "Id", "FileName", "FileTypePhysic", "Desc", "Url", "CreatedTime", "UpdatedTime", "ReposName", "TypeFile");
            }
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var query = ((from a in _context.EDMSRepoCatFiles.Where(x => x.ObjectCode == jTablePara.AssetCode && x.ObjectType == EnumHelper<AssetEnum>.GetDisplayValue(AssetEnum.Asset))
                          join b in _context.EDMSFiles.Where(x => !x.IsDeleted && x.IsFileMaster == null || x.IsFileMaster == true) on a.FileCode equals b.FileCode
                          join f in _context.EDMSRepositorys on a.ReposCode equals f.ReposCode into f1
                          from f in f1.DefaultIfEmpty()
                          select new
                          {
                              a.Id,
                              b.FileCode,
                              b.FileName,
                              b.FileTypePhysic,
                              b.Desc,
                              b.CreatedTime,
                              b.CloudFileId,
                              TypeFile = "NO_SHARE",
                              ReposName = f != null ? f.ReposName : "",
                              b.IsFileMaster,
                              b.EditedFileBy,
                              b.EditedFileTime,
                              b.FileID,
                          }).Union(
                  from a in _context.EDMSObjectShareFiles.Where(x => x.ObjectCode == jTablePara.AssetCode && x.ObjectType == EnumHelper<AssetEnum>.GetDisplayValue(AssetEnum.Asset))
                  join b in _context.EDMSFiles.Where(x => !x.IsDeleted && x.IsFileMaster == null || x.IsFileMaster == true) on a.FileCode equals b.FileCode
                  join f in _context.EDMSRepositorys on b.ReposCode equals f.ReposCode into f1
                  from f in f1.DefaultIfEmpty()
                  select new
                  {
                      a.Id,
                      b.FileCode,
                      b.FileName,
                      b.FileTypePhysic,
                      b.Desc,
                      b.CreatedTime,
                      b.CloudFileId,
                      TypeFile = "NO_SHARE",
                      ReposName = f != null ? f.ReposName : "",
                      b.IsFileMaster,
                      b.EditedFileBy,
                      b.EditedFileTime,
                      b.FileID,
                  })).AsNoTracking();
            int count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "FileCode", "FileName", "FileTypePhysic", "Desc", "CreatedTime", "CloudFileId", "ReposName", "TypeFile", "IsFileMaster", "EditedFileBy", "EditedFileTime", "FileID");
            return jdata;
        }

        [HttpPost]
        public object JTableFileHistory([FromBody]JTableModelFile jTablePara)
        {
            if (string.IsNullOrEmpty(jTablePara.AssetCode) || jTablePara.FileID == null)
            {
                return JTableHelper.JObjectTable(new List<object>(), jTablePara.Draw, 0, "Id", "FileName", "FileTypePhysic", "Desc", "Url", "CreatedTime", "UpdatedTime", "ReposName", "TypeFile", "IsFileMaster", "EditedFileBy", "EditedFileTime", "FileID");
            }
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var query = (from a in _context.EDMSRepoCatFiles.Where(x => x.ObjectCode == jTablePara.AssetCode && x.ObjectType == EnumHelper<AssetEnum>.GetDisplayValue(AssetEnum.Asset))
                         join b in _context.EDMSFiles.Where(x => !x.IsDeleted && x.FileParentId.Equals(jTablePara.FileID) && (x.IsFileMaster == null || x.IsFileMaster == false)) on a.FileCode equals b.FileCode
                         join f in _context.EDMSRepositorys on a.ReposCode equals f.ReposCode into f1
                         from f in f1.DefaultIfEmpty()
                         select new
                         {
                             a.Id,
                             b.FileCode,
                             b.FileName,
                             b.FileTypePhysic,
                             b.Desc,
                             b.CreatedTime,
                             b.CloudFileId,
                             TypeFile = "NO_SHARE",
                             ReposName = f != null ? f.ReposName : "",
                             b.IsFileMaster,
                             EditedFileBy = _context.Users.FirstOrDefault(x => x.UserName.Equals(b.EditedFileBy)) != null ? _context.Users.FirstOrDefault(x => x.UserName.Equals(b.EditedFileBy)).GivenName : "",
                             b.EditedFileTime,
                         }).AsNoTracking();
            int count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "FileCode", "FileName", "FileTypePhysic", "Desc", "CreatedTime", "CloudFileId", "ReposName", "TypeFile", "IsFileMaster", "EditedFileBy", "EditedFileTime");
            return jdata;
        }

        [HttpPost]
        [RequestFormLimits(MultipartBodyLengthLimit = long.MaxValue)]
        [RequestSizeLimit(long.MaxValue)]
        public JsonResult InsertAssetFile(EDMSRepoCatFileModel obj, IFormFile fileUpload)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var mimeType = fileUpload.ContentType;
                string extension = Path.GetExtension(fileUpload.FileName);
                string urlFile = "";
                string fileId = "";
                if (Array.IndexOf(LuceneExtension.fileMimetypes, mimeType) >= 0 && (Array.IndexOf(LuceneExtension.fileExt, extension.ToUpper()) >= 0))
                {
                    string reposCode = "";
                    string catCode = "";
                    string path = "";
                    string folderId = "";
                    //Chọn file ngắn gọn
                    if (!obj.IsMore)
                    {
                        var suggesstion = GetSuggestionsAssetFile(obj.AssetCode);
                        if (suggesstion != null)
                        {
                            reposCode = suggesstion.ReposCode;
                            path = suggesstion.Path;
                            folderId = suggesstion.FolderId;
                            catCode = suggesstion.CatCode;
                        }
                        else
                        {
                            msg.Error = true;
                            msg.Title = _stringLocalizerCus["CUS_TITLE_ENTER_EXPEND"];
                            return Json(msg);
                        }
                    }
                    //Hiển file mở rộng
                    else
                    {
                        var setting = _context.EDMSCatRepoSettings.FirstOrDefault(x => x.Id == obj.CateRepoSettingId);
                        if (setting != null)
                        {
                            reposCode = setting.ReposCode;
                            path = setting.Path;
                            folderId = setting.FolderId;
                            catCode = setting.CatCode;
                        }
                        else
                        {
                            msg.Error = true;
                            msg.Title = _stringLocalizerCus["CUS_ERROR_CHOOSE_FILE"];
                            return Json(msg);
                        }
                    }
                    var getRepository = _context.EDMSRepositorys.FirstOrDefault(x => x.ReposCode == reposCode);
                    if (getRepository.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.Server))
                    {
                        using (var ms = new MemoryStream())
                        {
                            fileUpload.CopyTo(ms);
                            var fileBytes = ms.ToArray();
                            urlFile = path + Path.Combine("/", fileUpload.FileName);
                            var urlFilePreventive = path + Path.Combine("/", Guid.NewGuid().ToString().Substring(0, 8) + fileUpload.FileName);
                            var urlEnd = System.Web.HttpUtility.UrlPathEncode("ftp://" + getRepository.Server + urlFile);
                            var urlEndPreventive = System.Web.HttpUtility.UrlPathEncode("ftp://" + getRepository.Server + urlFilePreventive);
                            var result = FileExtensions.UploadFileToFtpServer(urlEnd, urlEndPreventive, fileBytes, getRepository.Account, getRepository.PassWord);
                            if (result.Status == WebExceptionStatus.ConnectFailure || result.Status == WebExceptionStatus.ProtocolError)
                            {
                                msg.Error = true;
                                msg.Title = _sharedResources["COM_CONNECT_FAILURE"];
                                return Json(msg);
                            }
                            else if (result.Status == WebExceptionStatus.Success)
                            {
                                if (result.IsSaveUrlPreventive)
                                {
                                    urlFile = urlFilePreventive;
                                }
                            }
                            else
                            {
                                msg.Error = true;
                                msg.Title = _sharedResources["COM_MSG_ERR"];
                                return Json(msg);
                            }
                        }
                    }
                    else if (getRepository.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.GooglerDriver))
                    {
                        fileId = FileExtensions.UploadFileToDrive(_hostingEnvironment.WebRootPath + "\\files\\credentials.json", _hostingEnvironment.WebRootPath + "\\files\\token.json", fileUpload.FileName, fileUpload.OpenReadStream(), fileUpload.ContentType, folderId);
                    }
                    var edmsReposCatFile = new EDMSRepoCatFile
                    {
                        FileCode = string.Concat("ASSET", Guid.NewGuid().ToString()),
                        ReposCode = reposCode,
                        CatCode = catCode,
                        ObjectCode = obj.AssetCode,
                        ObjectType = EnumHelper<AssetEnum>.GetDisplayValue(AssetEnum.Asset),
                        Path = path,
                        FolderId = folderId
                    };
                    _context.EDMSRepoCatFiles.Add(edmsReposCatFile);

                    /// created Index lucene
                    LuceneExtension.IndexFile(edmsReposCatFile.FileCode, fileUpload, string.Concat(_hostingEnvironment.WebRootPath, "\\uploads\\luceneIndex"));

                    //add File
                    var file = new EDMSFile
                    {
                        FileCode = edmsReposCatFile.FileCode,
                        FileName = fileUpload.FileName,
                        Desc = obj.Desc,
                        ReposCode = reposCode,
                        Tags = obj.Tags,
                        FileSize = fileUpload.Length,
                        FileTypePhysic = Path.GetExtension(fileUpload.FileName),
                        NumberDocument = obj.NumberDocument,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now,
                        Url = urlFile,
                        MimeType = mimeType,
                        CloudFileId = fileId,
                    };
                    _context.EDMSFiles.Add(file);
                    _context.SaveChanges();
                    msg.Title = _stringLocalizerCus["CUS_TITLE_ADD_FILE_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizerCus["CUS_TITLE_FORMAT_FILE"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = _stringLocalizerCus["CUS_TITLE_ERROR_TRYON"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult UpdateAssetFile(EDMSRepoCatFileModel obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                string path = "";
                string fileId = "";
                var oldSetting = _context.EDMSRepoCatFiles.FirstOrDefault(x => x.FileCode == obj.FileCode);
                if (oldSetting != null)
                {
                    var newSetting = _context.EDMSCatRepoSettings.FirstOrDefault(x => x.Id == obj.CateRepoSettingId);
                    if (newSetting != null)
                    {
                        var file = _context.EDMSFiles.FirstOrDefault(x => x.FileCode == oldSetting.FileCode);
                        //change folder
                        if ((string.IsNullOrEmpty(oldSetting.Path) && oldSetting.FolderId != newSetting.FolderId) || (string.IsNullOrEmpty(oldSetting.FolderId) && oldSetting.Path != newSetting.Path))
                        {
                            //dowload file old
                            var oldRepo = _context.EDMSRepositorys.FirstOrDefault(x => x.ReposCode == oldSetting.ReposCode);
                            byte[] fileData = null;
                            if (oldRepo.Type == "SERVER")
                            {
                                string ftphost = oldRepo.Server;
                                string ftpfilepath = file.Url;
                                var urlEnd = System.Web.HttpUtility.UrlPathEncode("ftp://" + ftphost + ftpfilepath);
                                using (WebClient request = new WebClient())
                                {
                                    request.Credentials = new NetworkCredential(oldRepo.Account, oldRepo.PassWord);
                                    fileData = request.DownloadData(urlEnd);
                                }
                            }
                            else
                            {
                                fileData = FileExtensions.DowloadFileGoogle(_hostingEnvironment.WebRootPath + "\\files\\credentials.json", _hostingEnvironment.WebRootPath + "\\files\\token.json", file.CloudFileId);
                            }
                            //delete folder old
                            if (oldRepo.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.Server))
                            {
                                var urlEnd = System.Web.HttpUtility.UrlPathEncode("ftp://" + oldRepo.Server + file.Url);
                                FileExtensions.DeleteFileFtpServer(urlEnd, oldRepo.Account, oldRepo.PassWord);
                            }
                            else if (oldRepo.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.GooglerDriver))
                            {
                                FileExtensions.DeleteFileGoogleServer(_hostingEnvironment.WebRootPath + "\\files\\credentials.json", _hostingEnvironment.WebRootPath + "\\files\\token.json", file.CloudFileId);
                            }

                            //insert folder new
                            var newRepo = _context.EDMSRepositorys.FirstOrDefault(x => x.ReposCode == newSetting.ReposCode);
                            if (newRepo.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.Server))
                            {
                                path = newSetting.Path + Path.Combine("/", file.FileName);
                                var pathPreventive = path + Path.Combine("/", Guid.NewGuid().ToString().Substring(0, 8) + file.FileName);
                                var urlEnd = System.Web.HttpUtility.UrlPathEncode("ftp://" + newRepo.Server + path);
                                var urlEndPreventive = System.Web.HttpUtility.UrlPathEncode("ftp://" + newRepo.Server + pathPreventive);
                                var result = FileExtensions.UploadFileToFtpServer(urlEnd, urlEndPreventive, fileData, newRepo.Account, newRepo.PassWord);
                                if (result.Status == WebExceptionStatus.ConnectFailure || result.Status == WebExceptionStatus.ProtocolError)
                                {
                                    msg.Error = true;
                                    msg.Title = _sharedResources["COM_CONNECT_FAILURE"];
                                    return Json(msg);
                                }
                                else if (result.Status == WebExceptionStatus.Success)
                                {
                                    if (result.IsSaveUrlPreventive)
                                    {
                                        path = pathPreventive;
                                    }
                                }
                                else
                                {
                                    msg.Error = true;
                                    msg.Title = _sharedResources["COM_MSG_ERR"];
                                    return Json(msg);
                                }
                            }
                            else if (newRepo.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.GooglerDriver))
                            {
                                fileId = FileExtensions.UploadFileToDrive(_hostingEnvironment.WebRootPath + "\\files\\credentials.json", _hostingEnvironment.WebRootPath + "\\files\\token.json", file.FileName, new MemoryStream(fileData), file.MimeType, newSetting.FolderId);
                            }
                            file.CloudFileId = fileId;
                            file.Url = path;

                            //update setting new
                            oldSetting.CatCode = newSetting.CatCode;
                            oldSetting.ReposCode = newSetting.ReposCode;
                            oldSetting.Path = newSetting.Path;
                            oldSetting.FolderId = newSetting.FolderId;
                            _context.EDMSRepoCatFiles.Update(oldSetting);
                        }
                        //update header
                        file.Desc = obj.Desc;
                        file.Tags = obj.Tags;
                        file.NumberDocument = obj.NumberDocument;
                        _context.EDMSFiles.Update(file);
                        _context.SaveChanges();
                        msg.Title = _stringLocalizerCus["CUS_TITLE_UPDATE_INFO_SUCCESS"];
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizerCus["CUS_ERROR_CHOOSE_FILE"];
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizerCus["CUS_TITLE_FILE_NOT_EXIST"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_FAILED"], _stringLocalizerCus[""]);// "Có lỗi xảy ra khi cập nhật!";
                msg.Object = ex;
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult DeleteAssetFile(int id)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var data = _context.EDMSRepoCatFiles.FirstOrDefault(x => x.Id == id);
                _context.EDMSRepoCatFiles.Remove(data);

                var file = _context.EDMSFiles.FirstOrDefault(x => x.FileCode == data.FileCode);
                _context.EDMSFiles.Remove(file);

                LuceneExtension.DeleteIndexFile(file.FileCode, _hostingEnvironment.WebRootPath + "\\uploads\\luceneIndex");
                var getRepository = _context.EDMSRepositorys.FirstOrDefault(x => x.ReposCode == data.ReposCode);
                if (getRepository != null)
                {
                    if (getRepository.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.Server))
                    {
                        var urlEnd = System.Web.HttpUtility.UrlPathEncode("ftp://" + getRepository.Server + file.Url);
                        FileExtensions.DeleteFileFtpServer(urlEnd, getRepository.Account, getRepository.PassWord);
                    }
                    else if (getRepository.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.GooglerDriver))
                    {
                        FileExtensions.DeleteFileGoogleServer(_hostingEnvironment.WebRootPath + "\\files\\credentials.json", _hostingEnvironment.WebRootPath + "\\files\\token.json", file.CloudFileId);
                    }
                }
                _context.SaveChanges();
                msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizer[""]);// "Xóa thành công";
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_FAIL"], _stringLocalizer[""]);//"Có lỗi xảy ra khi xóa!";
                msg.Object = ex;
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetAssetFile(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            var model = new EDMSRepoCatFileModel();
            try
            {
                var data = _context.EDMSRepoCatFiles.FirstOrDefault(m => m.Id == id);
                if (data != null)
                {
                    var file = _context.EDMSFiles.FirstOrDefault(x => x.FileCode == data.FileCode);
                    //header file
                    model.FileCode = file.FileCode;
                    model.NumberDocument = file.NumberDocument;
                    model.Tags = file.Tags;
                    model.Desc = file.Desc;
                    //category file
                    model.CateRepoSettingCode = data.CatCode;
                    model.CateRepoSettingId = data.Id;
                    model.Path = data.Path;
                    model.FolderId = data.FolderId;
                    msg.Object = model;
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["CONTRACT_MSG_FILE_DOES_NOT_EXIST"]);//"Tệp tin không tồn tại!";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = _stringLocalizer["CUS_TITLE_ERROR_TRYON"];
            }
            return Json(msg);
        }

        [HttpGet]
        public EDMSRepoCatFile GetSuggestionsAssetFile(string assetCode)
        {
            var query = _context.EDMSRepoCatFiles.Where(x => x.ObjectCode == assetCode && x.ObjectType == EnumHelper<AssetEnum>.GetDisplayValue(AssetEnum.Asset)).MaxBy(x => x.Id);
            return query;
        }
        #endregion

        public class JTableAllocatedAsset : JTableModel
        {
            public int ID { get; set; }
            public string AssetCode { get; set; }
            public int Quantity { get; set; }
            public string CostValue { get; set; }
            public string Image { get; set; }
            public string Status { get; set; }
            public string Note { get; set; }
        }

        public class ActivityLogDataRes
        {
            public int ID { get; set; }
            public string ActCode { get; set; }
            public string ObjActCode { get; set; }
            public string ObjCode { get; set; }
            public string ActTime { get; set; }
            public decimal ActLocationGPS { get; set; }
            public string ActFromDevice { get; set; }
            public string ActType { get; set; }
        }
        public class AssetAllocateRes
        {
            public int ID { get; set; }
            public string TicketCode { get; set; }
            public string Title { get; set; }
            public string DepartmentSend { get; set; }
            public string UserAllocate { get; set; }
            public string AllocateTime { get; set; }
            public string DepartmentReceive { get; set; }
            public string LocationSend { get; set; }
            public string UserReceiver { get; set; }
            public string Status { get; set; }
            public string Note { get; set; }
            public string ObjActCode { get; set; }
        }

        public class AssetAllocateDetailRes
        {
            public string AssetCode { get; set; }
            public string Quantity { get; set; }
            public string Note { get; set; }
            public string Status { get; set; }
            public string TicketCode { get; set; }
        }

        public class ModelWorkFolwRole
        {
            public string WorkFlowCode { get; set; }
            public string ActCode { get; set; }
        }

        public class JAssetDetail : JTableModel
        {
            public int ID { get; set; }
            public string AssetCode { get; set; }
            public string AssetName { get; set; }
            public string Quantity { get; set; }
            public string DepartmentReceive { get; set; }
            public string AllocateTime { get; set; }
            public string UserReceiver { get; set; }
            public string LocationSend { get; set; }
            public string TicketCode { get; set; }
        }
        public class JTableModelAssetTicket : JTableModel
        {
            public int ID { get; set; }
            public string TicketCode { get; set; }
            public string Title { get; set; }
            public string DepartmentSend { get; set; }
            public string UserAllocate { get; set; }
            public string AllocateTime { get; set; }
            public string DepartmentReceive { get; set; }
            public string LocationSend { get; set; }
            public string UserReceiver { get; set; }
            public string Status { get; set; }
            public string Note { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
        }
        public class JTableActivityModel : JTableModel
        {
            public int ID { get; set; }
            public string ActName { get; set; }
            public string ActType { get; set; }
            public string User { get; set; }
            public string LocationGPS { get; set; }
            public string Result { get; set; }
            public string TicketCode { get; set; }
            public string ObjCode { get; set; }
            public string ObjActCode { get; set; }
        }
        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
                        .Union(_stringLocalizerCus.GetAllStrings().Select(x => new { x.Name, x.Value }))
                        .Union(_inventoryController.GetAllStrings().Select(x => new { x.Name, x.Value }))
                        .Union(_stringLocalizerFile.GetAllStrings().Select(x => new { x.Name, x.Value })).Union(_contractController.GetAllStrings().Select(x => new { x.Name, x.Value }))
                        .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }
        #endregion
    }
}