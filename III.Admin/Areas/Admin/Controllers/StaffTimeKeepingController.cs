using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using III.Domain.Enums;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using Syncfusion.XlsIO;
using Syncfusion.Drawing;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class StaffTimeKeepingController : BaseController
    {
        public class SStaffTimeKeepingJtableModel : JTableModel
        {
            public string UserId { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
        }
        private readonly EIMDBContext _context;
        private TimeSpan _timeWorking;
        private readonly IUploadService _upload;
        private readonly IStringLocalizer<StaffTimeKeepingController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IGoogleAPIService _googleAPI;
        private readonly IParameterService _parameterService;

        public StaffTimeKeepingController(EIMDBContext context, IStringLocalizer<StaffTimeKeepingController> stringLocalizer,
            IStringLocalizer<SharedResources> sharedResources, IGoogleAPIService googleAPI, IParameterService parameterService,
            IUploadService upload)
        {
            _context = context;
            _timeWorking = new TimeSpan(8, 30, 0);
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
            _googleAPI = googleAPI;
            _parameterService = parameterService;
            _upload = upload;
        }
        public IActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public JsonResult JTable([FromBody]SStaffTimeKeepingJtableModel jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var today = DateTime.Today;
            var fromTime = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toTime = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            if (fromTime == null && toTime == null && string.IsNullOrEmpty(jTablePara.UserId))
            {
                fromTime = today;
                toTime = today;
            }
            var query = from a in _context.ShiftLogs
                        where ((fromTime == null) || (a.ChkinTime.Value.Date >= fromTime.Value.Date))
                         && ((toTime == null) || (a.ChkinTime.Value.Date <= toTime.Value.Date))
                         && (string.IsNullOrEmpty(jTablePara.UserId) || a.CreatedBy == jTablePara.UserId)
                        select new
                        {
                            a.Id,
                            a.FromDevice,
                            ChkInTime = a.ChkinTime.Value.ToString("dd/MM/yyyy HH:mm:ss"),
                            a.ChkinLocationTxt,
                            ChkOutTime = a.ChkoutTime.HasValue ? a.ChkoutTime.Value.ToString("dd/MM/yyyy HH:mm:ss") : "",
                            a.ChkoutLocationTxt,
                            a.ShiftCode,
                            a.Note,
                            a.CreatedBy
                        };
            var count = query.Count();
            var data = query.AsNoTracking().Skip(intBeginFor).Take(jTablePara.Length).ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "FromDevice", "ChkInTime", "ChkinLocationTxt", "ChkOutTime", "ChkoutLocationTxt", "ShiftCode", "Note", "CreatedBy");
            return Json(jdata);
        }

        //public object JTable([FromBody]SStaffTimeKeepingJtableModel jTablePara)
        //{
        //    int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
        //    var today = DateTime.Today;
        //    var fromTime = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
        //    var toTime = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

        //    if (fromTime == null && toTime == null && string.IsNullOrEmpty(jTablePara.UserId))
        //    {
        //        fromTime = today;
        //        toTime = today;
        //    }
        //    var query = (from a in _context.WorkShiftCheckInOuts
        //                 join b in _context.Users on a.UserId equals b.Id
        //                 where (a.Action == EnumHelper<StaffStauts>.GetDisplayValue(StaffStauts.CheckIn) || a.Action == EnumHelper<StaffStauts>.GetDisplayValue(StaffStauts.CheckOut))
        //                 && (string.IsNullOrEmpty(jTablePara.UserId) || b.Id.Equals(jTablePara.UserId))
        //                 && ((fromTime == null) || (a.ActionTime.Date >= fromTime.Value.Date))
        //                 && ((toTime == null) || (a.ActionTime.Date <= toTime.Value.Date))
        //                 && !a.IsDeleted
        //                 select new
        //                 {
        //                     a.Id,
        //                     a.UserId,
        //                     FullName = b.GivenName,
        //                     b.Picture,
        //                     Action = (a.Session == 1 && a.Action == EnumHelper<StaffStauts>.GetDisplayValue(StaffStauts.CheckIn) && a.ActionTime.TimeOfDay > _timeWorking) ? "<span class='text-danger'>CheckIn</span>" :
        //                     (a.Session == 1 && a.Action == EnumHelper<StaffStauts>.GetDisplayValue(StaffStauts.CheckIn) && a.ActionTime.TimeOfDay > _timeWorking) ? "<span class='text-success'>CheckIn</span>" :
        //                     (a.Session != 1 && a.Action == EnumHelper<StaffStauts>.GetDisplayValue(StaffStauts.CheckIn)) ? "<span class='text-success'>CheckIn</span>" : "<span class='text-warning'>CheckOut</span>",
        //                     a.ActionTime,
        //                     a.LocationGPS,
        //                     a.LocationText,
        //                     a.Session,
        //                     a.ShiftCode
        //                 }).OrderByDescending(x => x.UserId).ThenByDescending(x => x.ActionTime);

        //    var count = (from a in _context.WorkShiftCheckInOuts
        //                 join b in _context.Users on a.UserId equals b.Id
        //                 where (a.Action == EnumHelper<StaffStauts>.GetDisplayValue(StaffStauts.CheckIn) || a.Action == EnumHelper<StaffStauts>.GetDisplayValue(StaffStauts.CheckOut))
        //                 && (string.IsNullOrEmpty(jTablePara.UserId) || b.Id.Equals(jTablePara.UserId))
        //                 && ((fromTime == null) || (a.ActionTime.Date >= fromTime.Value.Date))
        //                 && ((toTime == null) || (a.ActionTime.Date <= toTime.Value.Date))
        //                 select a).Count();
        //    var data1 = query.AsNoTracking().Skip(intBeginFor).Take(jTablePara.Length).ToList();
        //    var jdata = JTableHelper.JObjectTable(data1, jTablePara.Draw, count, "Id", "Picture", "FullName", "Action", "ActionTime", "LocationGPS", "LocationText", "Session", "ShiftCode");
        //    return Json(jdata);
        //}

        [HttpPost]
        public async System.Threading.Tasks.Task<JsonResult> CheckIn([FromBody]ShiftLogModel shift)
        {
            var msg = new JMessage { Title = "", Error = false };
            if (AllowCheckInOut() == true)
            {
                var session = HttpContext.GetSessionUser();
                try
                {
                    var ip = Request.HttpContext.Connection.RemoteIpAddress.ToString();
                    var currentTime = DateTime.Now;
                    var shifLog = new ShiftLog
                    {
                        ShiftCode = currentTime.ToString("HHmmssddMMyyyy"),
                        ChkinTime = currentTime,
                        ChkinLocationGps = string.Format("[{0},{1}]", shift.Lat, shift.Lon),
                        ChkinLocationTxt = await _googleAPI.GetAddressForCoordinates(shift.Lat, shift.Lon),
                        IsChkinRealtime = true,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = currentTime,
                        FromDevice = "Desktop/Laptop",
                        Ip = ip,
                    };
                    _context.ShiftLogs.Add(shifLog);
                    _context.SaveChanges();
                    msg.Title = _stringLocalizer["STK_MSG_CHECK_IN_SUCCESS"];
                }
                catch (Exception ex)
                {
                    msg.Error = true;
                    msg.Title = _sharedResources["COM_MSG_ERR"];
                }
            }
            else
            {
                msg.Error = true;
                msg.Title = _stringLocalizer["STK_MSG_PLS_CHECK_OUT"];
            }

            return Json(msg);
        }

        [HttpPost]
        public JsonResult CheckInOutManual([FromBody]ShiftLogManual shift)
        {
            var msg = new JMessage { Title = "", Error = false };
            var session = HttpContext.GetSessionUser();
            try
            {
                var checkInTime = !string.IsNullOrEmpty(shift.ChkinTime) ? DateTime.ParseExact(shift.ChkinTime, "dd/MM/yyyy HH:mm:ss", CultureInfo.InvariantCulture) : (DateTime?)null;
                var checkOutTime = !string.IsNullOrEmpty(shift.ChkoutTime) ? DateTime.ParseExact(shift.ChkoutTime, "dd/MM/yyyy HH:mm:ss", CultureInfo.InvariantCulture) : (DateTime?)null;
                var ip = Request.HttpContext.Connection.RemoteIpAddress.ToString();
                var shifLog = new ShiftLog
                {
                    ShiftCode = checkInTime.Value.ToString("HHmmssddMMyyyy") + "_" + checkOutTime.Value.ToString("HHmmssddMMyyyy"),
                    ChkinTime = checkInTime,
                    ChkoutTime = checkOutTime,
                    ChkinLocationTxt = shift.ChkinLocationTxt,
                    ChkoutLocationTxt = shift.ChkoutLocationTxt,
                    IsChkinRealtime = false,
                    IsChkoutReadtime = false,
                    ChkinPicRealtime = shift.ChkinPicRealtime,
                    ChkoutPicRealtime = shift.ChkoutPicRealtime,
                    CreatedBy = ESEIM.AppContext.UserName,
                    CreatedTime = DateTime.Now,
                    FromDevice = "Desktop/Laptop",
                    Ip = ip,
                    Note = shift.Note
                };
                _context.ShiftLogs.Add(shifLog);
                _context.SaveChanges();
                msg.Title = _stringLocalizer["STK_MSG_ADD_WORK_SHIFT_SUCCESS"];
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public async System.Threading.Tasks.Task<JsonResult> CheckOut([FromBody]ShiftLogModel shift)
        {
            var msg = new JMessage();
            if (AllowCheckInOut() == false)
            {
                try
                {
                    var ip = Request.HttpContext.Connection.RemoteIpAddress.ToString();
                    var currentTime = DateTime.Now;
                    var shifLog = _context.ShiftLogs.LastOrDefault(x => x.ShiftCode == shift.ShiftCode);
                    if (shifLog != null)
                    {
                        shifLog.ShiftCode = shifLog.ShiftCode + "_" + currentTime.ToString("HHmmssddMMyyyy");
                        shifLog.ChkoutLocationGps = string.Format("[{0},{1}]", shift.Lat, shift.Lon);
                        shifLog.ChkoutLocationTxt = await _googleAPI.GetAddressForCoordinates(shift.Lat, shift.Lon);
                        shifLog.ChkoutTime = currentTime;
                        shifLog.IsChkoutReadtime = true;
                        shifLog.Ip = ip;
                        shifLog.FromDevice = "Desktop/Laptop";

                        var itemSession = _context.WORKItemSessions.Where(x => !x.IsDeleted && x.ShiftCode == shift.ShiftCode);
                        if (itemSession.Any())
                        {
                            foreach (var item in itemSession)
                            {
                                item.ShiftCode = shifLog.ShiftCode;
                                _context.WORKItemSessions.Update(item);
                            }
                        }
                        var itemSessionResult = _context.WORKItemSessionResults.Where(x => !x.IsDeleted && x.ShiftCode == shift.ShiftCode);
                        if (itemSessionResult.Any())
                        {
                            foreach (var item in itemSessionResult)
                            {
                                item.ShiftCode = shifLog.ShiftCode;
                                _context.WORKItemSessionResults.Update(item);
                            }
                        }

                        _context.ShiftLogs.Update(shifLog);
                        _context.SaveChanges();
                        msg.Title = _stringLocalizer["STK_MSG_CHECK_OUT_SUCCESS"];
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["STK_MSG_NOT_FOUND_WORK_SHIFT"];
                    }
                }
                catch (Exception ex)
                {
                    msg.Title = _sharedResources["COM_MSG_ERR"];
                    msg.Error = true;
                }
            }
            else
            {
                msg.Error = true;
                msg.Title = _stringLocalizer["STK_MSG_PLS_CHECK_IN"];
            }

            return Json(msg);
        }

        [HttpPost]
        public JsonResult UpdateCheckInOutManual([FromBody]ShiftLogManual shift)
        {
            var msg = new JMessage();
            try
            {
                var checkInTime = !string.IsNullOrEmpty(shift.ChkinTime) ? DateTime.ParseExact(shift.ChkinTime, "dd/MM/yyyy HH:mm:ss", CultureInfo.InvariantCulture) : (DateTime?)null;
                var checkOutTime = !string.IsNullOrEmpty(shift.ChkoutTime) ? DateTime.ParseExact(shift.ChkoutTime, "dd/MM/yyyy HH:mm:ss", CultureInfo.InvariantCulture) : (DateTime?)null;
                var ip = Request.HttpContext.Connection.RemoteIpAddress.ToString();
                var currentTime = DateTime.Now;
                var shifLog = _context.ShiftLogs.LastOrDefault(x => x.ShiftCode == shift.ShiftCode);
                if (shifLog != null)
                {
                    shifLog.ShiftCode = checkInTime.Value.ToString("HHmmssddMMyyyy") + "_" + checkOutTime.Value.ToString("HHmmssddMMyyyy");
                    shifLog.ChkinTime = checkInTime;
                    shifLog.ChkinLocationTxt = shift.ChkinLocationTxt;
                    shifLog.ChkoutLocationTxt = shift.ChkoutLocationTxt;
                    shifLog.ChkoutTime = checkOutTime;
                    shifLog.IsChkoutReadtime = false;
                    shifLog.IsChkinRealtime = false;
                    shifLog.Ip = ip;
                    shifLog.FromDevice = "Desktop/Laptop";
                    shifLog.ChkoutPicRealtime = shift.ChkoutPicRealtime;
                    shifLog.ChkinPicRealtime = shift.ChkinPicRealtime;
                    shifLog.Note = shift.Note;
                    _context.ShiftLogs.Update(shifLog);
                    _context.SaveChanges();
                    msg.Title = _stringLocalizer["STK_MSG_UPDATE_WORK_SHIFT_SUCCESS"];
                    msg.Object = shifLog;
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["STK_MSG_NOT_FOUND_WORK_SHIFT"];
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
        public object GetCheckInOutManual(string shiftCode)
        {
            var data = _context.ShiftLogs.FirstOrDefault(x => x.ShiftCode == shiftCode);
            var shift = new ShiftLogManual
            {
                ShiftCode = data.ShiftCode,
                ChkinTime = data.ChkinTime.Value.ToString("dd/MM/yyyy HH:mm:ss"),
                ChkinLocationTxt = data.ChkinLocationTxt,
                ChkoutTime = data.ChkoutTime.HasValue ? data.ChkoutTime.Value.ToString("dd/MM/yyyy HH:mm:ss") : "",
                ChkoutLocationTxt = data.ChkoutLocationTxt,
                ChkinPicRealtime = data.ChkinPicRealtime,
                ChkoutPicRealtime = data.ChkoutPicRealtime,
                Note = data.Note,
                IsChkinRealtime = data.IsChkinRealtime
            };
            return shift;
        }

        [HttpPost]
        public JsonResult GetLastInOut()
        {
            var msg = new JMessage();
            try
            {
                var session = HttpContext.GetSessionUser();
                var isCheckIn = false;
                var data = _context.ShiftLogs.LastOrDefault(x => x.CreatedBy == session.UserName && x.Flag != "DELETED" && x.Flag != "CANCEL");
                if (data != null)
                {
                    if (data.ChkoutTime == null)
                        isCheckIn = true;
                }
                else
                {
                    isCheckIn = false;
                }

                msg.Object = new
                {
                    ShiftCode = data != null ? data.ShiftCode : "",
                    IsCheckIn = isCheckIn
                };
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult UploadImage(IFormFile fileUpload)
        {
            var msg = new JMessage { Title = "", Error = false };
            try
            {
                var upload = _upload.UploadImage(fileUpload);
                msg.Object = upload.Object;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                msg.Object = ex;
            }
            return Json(msg);
        }

        //[HttpPost]
        //public JsonResult CheckIn([FromBody]SStaffTimeKeepingModelcheck obj)
        //{
        //    var msg = new JMessage { Error = false, Title = "" };
        //    try
        //    {
        //        var check = CheckCheckIn(obj.UserId);
        //        if (check.allowCheckIn)
        //        {
        //            var model = new WorkShiftCheckInOut
        //            {
        //                UserId = obj.UserId,
        //                Action = EnumHelper<StaffStauts>.GetDisplayValue(StaffStauts.CheckIn),
        //                ActionTime = DateTime.Now,
        //                Note = obj.Note,
        //                LocationGPS = string.Format("[{0},{1}]", obj.Lat, obj.Lon),
        //                LocationText = obj.LocationText,
        //                CreatedBy = obj.UserId,
        //                Device = "DeskTop",
        //                CreatedTime = DateTime.Now,
        //                Session = check.session + 1,
        //                ShiftCode = GenerateShiftCode(obj.UserId)
        //            };
        //            _context.WorkShiftCheckInOuts.Add(model);
        //            _context.SaveChanges();
        //            //msg.Title = String.Format(CommonUtil.ResourceValue("STK_MSG_CHECKININ_SUCCESS"));
        //            msg.Title = _stringLocalizer["STK_MSG_CHECKININ_SUCCESS"];
        //        }
        //        else
        //        {
        //            msg.Error = true;
        //            msg.Title = check.message;
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Object = ex.Message;
        //        msg.Error = true;
        //        msg.Title = _sharedResources["COM_MSG_ERR"];
        //    }
        //    return Json(msg);
        //}

        //[HttpPost]
        //public JsonResult CheckOut([FromBody]SStaffTimeKeepingModelcheck obj)
        //{
        //    var msg = new JMessage { Error = false, Title = "" };
        //    try
        //    {
        //        var check = CheckCheckOut(obj.UserId);
        //        if (check.allowCheckOut)
        //        {
        //            var model = new WorkShiftCheckInOut
        //            {
        //                UserId = obj.UserId,
        //                Action = EnumHelper<StaffStauts>.GetDisplayValue(StaffStauts.CheckOut),
        //                ActionTime = DateTime.Now,
        //                Note = obj.Note,
        //                LocationGPS = string.Format("[{0},{1}]", obj.Lat, obj.Lon),
        //                LocationText = obj.LocationText,
        //                CreatedBy = obj.UserId,
        //                Device = "DeskTop",
        //                CreatedTime = DateTime.Now,
        //                Session = check.session,
        //                ShiftCode = GetShiftCode(obj.UserId)
        //            };
        //            _context.WorkShiftCheckInOuts.Add(model);
        //            _context.SaveChanges();
        //            //msg.Title = String.Format(CommonUtil.ResourceValue("STK_MSG_CHECKOUT_SUCCESS"));
        //            msg.Title = _stringLocalizer["STK_MSG_CHECKOUT_SUCCESS"];
        //        }
        //        else
        //        {
        //            msg.Error = true;
        //            msg.Title = check.message;
        //        }

        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Object = ex.Message;
        //        msg.Error = true;
        //        msg.Title = _sharedResources["COM_MSG_ERR"];
        //    }
        //    return Json(msg);
        //}

        [HttpPost]
        public JsonResult Delete([FromBody]int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.WorkShiftCheckInOuts.FirstOrDefault(x => x.Id == id);
                if (data != null)
                {
                    data.IsDeleted = true;
                    data.DeletedBy = ESEIM.AppContext.UserName;
                    data.DeletedTime = DateTime.Now;
                    _context.WorkShiftCheckInOuts.Update(data);
                }
                _context.SaveChanges();
                //msg.Title = String.Format(CommonUtil.ResourceValue("COM_DELETE_SUCCESS"));
                msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = String.Format(CommonUtil.ResourceValue("COM_ERR_DELETE"));
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        //[NonAction]
        //public (bool allowCheckIn, int session, string message) CheckCheckIn(string id)
        //{
        //    bool allowCheckIn = false;
        //    string message = "";
        //    var today = DateTime.Today;
        //    int maxSession = 0;

        //    var getListCheckInCheckOut = _context.WorkShiftCheckInOuts.Where(x => x.ActionTime.Date == today && x.UserId == id).AsNoTracking();
        //    if (getListCheckInCheckOut.Any())
        //    {
        //        maxSession = getListCheckInCheckOut.Max(x => x.Session);
        //        var checkSession = getListCheckInCheckOut.Where(x => x.UserId == id && x.Session == maxSession && x.ActionTime.Date == today);
        //        if (checkSession.Any())
        //        {
        //            var checkCheckIn = checkSession.FirstOrDefault(x => x.Action == "CHECKIN");
        //            if (checkCheckIn != null)
        //            {
        //                var checkCheckOut = checkSession.FirstOrDefault(x => x.Action == "CHECKOUT");
        //                if (checkCheckOut != null)
        //                {
        //                    allowCheckIn = true;
        //                }
        //                else
        //                {
        //                    allowCheckIn = false;
        //                    message = "Người dùng đã checkIn!";
        //                }
        //            }
        //            else
        //            {
        //                allowCheckIn = true;
        //            }
        //        }
        //        else
        //        {
        //            allowCheckIn = true;
        //        }
        //    }
        //    else
        //    {
        //        allowCheckIn = true;
        //    }
        //    return (allowCheckIn, maxSession, message);
        //}

        //[NonAction]
        //public (bool allowCheckOut, int session, string message) CheckCheckOut(string id)
        //{
        //    bool allowCheckOut = false;
        //    string message = "";
        //    var today = DateTime.Today;
        //    int maxSession = 0;
        //    var getListCheckInCheckOut = _context.WorkShiftCheckInOuts.Where(x => x.ActionTime.Date == today && x.UserId == id).AsNoTracking();
        //    if (getListCheckInCheckOut.Any())
        //    {
        //        maxSession = getListCheckInCheckOut.Max(x => x.Session);
        //        var checkSession = getListCheckInCheckOut.Where(x => x.UserId == id && x.Session == maxSession && x.ActionTime.Date == today);
        //        if (checkSession.Any())
        //        {
        //            var checkCheckIn = checkSession.FirstOrDefault(x => x.Action == "CHECKIN");
        //            if (checkCheckIn != null)
        //            {
        //                var checkCheckOut = checkSession.FirstOrDefault(x => x.Action == "CHECKOUT");
        //                if (checkCheckOut != null)
        //                {
        //                    allowCheckOut = false;
        //                    message = "Người dùng đã checkOut!";
        //                }
        //                else
        //                {
        //                    allowCheckOut = true;
        //                }
        //            }
        //            else
        //            {
        //                allowCheckOut = false;
        //                message = "Người dùng không thể checkout khi chưa checkIn!";
        //            }
        //        }
        //        else
        //        {
        //            allowCheckOut = false;
        //            message = "Bạn không thể checkout khi chưa checkIn!";
        //        }
        //    }
        //    else
        //    {
        //        allowCheckOut = false;
        //        message = "Người dùng không thể checkout khi chưa checkIn!";
        //    }
        //    return (allowCheckOut, maxSession, message);
        //}

        [NonAction]
        public bool AllowCheckInOut()
        {
            var session = HttpContext.GetSessionUser();
            var data = _context.ShiftLogs.LastOrDefault(x => x.CreatedBy == session.UserName);
            if (data != null)
            {
                if (data.ChkinTime.HasValue && data.ChkoutTime.HasValue)
                {
                    return true;
                }
                else
                {
                    return false;
                }
            }
            else
            {
                return true;
            }
        }

        //Time working from date to date
        //public ActionResult ExportExcel(string uId, string fromDate, string toDate)
        //{
        //    var today = DateTime.Today;
        //    var fromTime = !string.IsNullOrEmpty(fromDate) ? DateTime.ParseExact(fromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
        //    var toTime = !string.IsNullOrEmpty(toDate) ? DateTime.ParseExact(toDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
        //    if (fromTime == null && toTime == null)
        //    {
        //        fromTime = today;
        //        toTime = today;
        //    }
        //    var query = (from a in _context.ShiftLogs
        //                 where (string.IsNullOrEmpty(uId) || a.CreatedBy.Equals(uId))
        //                  && ((fromTime == null) || (a.ChkinTime.Value.Date >= fromTime.Value.Date))
        //                 && ((toTime == null) || ((a.ChkoutTime.HasValue ? a.ChkoutTime.Value.Date : DateTime.Now.Date) <= toTime.Value.Date))
        //                 select new
        //                 {
        //                     a.Id,
        //                     a.ShiftCode,
        //                     //c2.WorkSession,
        //                     //CardCode = "#" + c2.CardCode,
        //                     //d.ProgressFromLeader,
        //                     a.CreatedBy,
        //                     a.ChkinTime,
        //                     a.ChkoutTime
        //                 }).GroupBy(x => x.CreatedBy);
        //    var listTimeWorking = new List<TimeWorkingSheet>();
        //    if (query.Any())
        //    {
        //        foreach (var item in query)
        //        {
        //            double timeWorking = 0;
        //            var timeSheet = new TimeWorkingSheet();
        //            var sessionUser = item.DistinctBy(x => x.ShiftCode).ToList();
        //            foreach (var session in sessionUser)
        //            {
        //                timeWorking += (session.ChkoutTime.HasValue? session.ChkoutTime.Value.Subtract(session.ChkinTime.Value).TotalSeconds : 0);
        //                timeSheet.Detail += "[" + session.ChkinTime.Value.ToString("dd/MM/yyyy HH:mm:ss") + (!session.ChkoutTime.HasValue ? ("_") : ("_" + session.ChkoutTime.Value.ToString("HH:mm:ss dd/MM/yyyy"))) + "], ";
        //            }
        //            timeSheet.ID = item.First().Id;
        //            timeSheet.UserName = item.First().CreatedBy;
        //            TimeSpan time = TimeSpan.FromSeconds(timeWorking);
        //            var hours = time.Days * 24 + time.Hours;
        //            var minutes = time.Minutes;
        //            var seconds = time.Seconds;
        //            timeSheet.TimeWorking = string.Format("{0}:{1}:{2}", hours, minutes, minutes);
        //            listTimeWorking.Add(timeSheet);
        //        }
        //    }
        //    ExcelEngine excelEngine = new ExcelEngine();
        //    IApplication application = excelEngine.Excel;
        //    application.DefaultVersion = ExcelVersion.Excel2010;
        //    IWorkbook workbook = application.Workbooks.Create(1);
        //    workbook.Version = ExcelVersion.Excel97to2003;
        //    IWorksheet sheetRequest = workbook.Worksheets.Create("Time Working");
        //    workbook.Worksheets[0].Remove();
        //    IMigrantRange migrantRange = workbook.Worksheets[0].MigrantRange;
        //    sheetRequest.Range["A1"].ColumnWidth = 24;
        //    sheetRequest.Range["B1"].ColumnWidth = 24;
        //    sheetRequest.Range["C1"].ColumnWidth = 24;
        //    sheetRequest.Range["D1"].ColumnWidth = 24;

        //    sheetRequest.Range["A1:D1"].Merge(true);

        //    sheetRequest.Range["A1"].Text = "Thời gian làm việc";
        //    sheetRequest.Range["A1"].CellStyle.Font.FontName = "Calibri";
        //    sheetRequest.Range["A1"].CellStyle.Font.Bold = true;
        //    sheetRequest.Range["A1"].CellStyle.Font.Size = 24;
        //    //sheetRequest.Range["A1"].CellStyle.Font.RGBColor = Color.FromArgb(0, 0, 176, 240);
        //    sheetRequest.Range["A1"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

        //    sheetRequest.ImportData(listTimeWorking, 2, 1, true);

        //    sheetRequest["A2"].Text = "ID";
        //    sheetRequest["B2"].Text = "Tên nhân viên";
        //    sheetRequest["C2"].Text = "Tổng số giờ làm";
        //    sheetRequest["D2"].Text = "Chi tiết";

        //    IStyle tableHeader = workbook.Styles.Add("TableHeaderStyle");
        //    tableHeader.Font.Color = ExcelKnownColors.Black;
        //    tableHeader.Font.Bold = true;
        //    tableHeader.Font.Size = 11;
        //    tableHeader.Font.FontName = "Calibri";
        //    tableHeader.HorizontalAlignment = ExcelHAlign.HAlignCenter;
        //    tableHeader.VerticalAlignment = ExcelVAlign.VAlignCenter;
        //    //tableHeader.Color = Color.FromArgb(0, 0, 122, 192);
        //    tableHeader.Borders[ExcelBordersIndex.EdgeLeft].LineStyle = ExcelLineStyle.None;
        //    tableHeader.Borders[ExcelBordersIndex.EdgeRight].LineStyle = ExcelLineStyle.None;
        //    tableHeader.Borders[ExcelBordersIndex.EdgeTop].LineStyle = ExcelLineStyle.None;
        //    tableHeader.Borders[ExcelBordersIndex.EdgeBottom].LineStyle = ExcelLineStyle.None;
        //    tableHeader.Borders[ExcelBordersIndex.EdgeBottom].LineStyle = ExcelLineStyle.None;
        //    sheetRequest["A2:D2"].CellStyle = tableHeader;
        //    sheetRequest.Range["A2:D2"].RowHeight = 20;
        //    sheetRequest.UsedRange.AutofitColumns();

        //    string ContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        //    var fileName = "ExportStaffTime" + DateTime.Now.ToString("yyyyMMddHHmmss") + ".xls";
        //    MemoryStream ms = new MemoryStream();
        //    workbook.SaveAs(ms);
        //    workbook.Close();
        //    excelEngine.Dispose();
        //    ms.Position = 0;
        //    return File(ms, ContentType, fileName);
        //}


        //[HttpPost]
        //public JsonResult JtableTimeWorking([FromBody] TimeWorkingSheetModel jTablepara)
        //{
        //    int intBeginFor = (jTablepara.CurrentPage - 1) * jTablepara.Length;
        //    var today = DateTime.Today;
        //    var fromTime = !string.IsNullOrEmpty(jTablepara.FromDate) ? DateTime.ParseExact(jTablepara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
        //    var toTime = !string.IsNullOrEmpty(jTablepara.ToDate) ? DateTime.ParseExact(jTablepara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
        //    if (fromTime == null && toTime == null)
        //    {
        //        fromTime = today;
        //        toTime = today;
        //    }
        //    var query = (from a in _context.ShiftLogs
        //                 where (string.IsNullOrEmpty(jTablepara.UserId) || a.CreatedBy.Equals(jTablepara.UserId))
        //                  && ((fromTime == null) || (a.ChkinTime.Value.Date >= fromTime.Value.Date))
        //                 && ((toTime == null) || ((a.ChkoutTime.HasValue ? a.ChkoutTime.Value.Date : DateTime.Now.Date) <= toTime.Value.Date))
        //                 select new
        //                 {
        //                     a.Id,
        //                     a.ShiftCode,
        //                     a.CreatedBy,
        //                     a.ChkinTime,
        //                     a.ChkoutTime
        //                 }).GroupBy(x => x.CreatedBy);
        //    var listTimeWorking = new List<TimeWorkingSheet>();
        //    if (query.Any())
        //    {
        //        foreach (var item in query)
        //        {
        //            double timeWorking = 0;
        //            var timeSheet = new TimeWorkingSheet();
        //            var sessionUser = item.DistinctBy(x => x.ShiftCode).ToList();
        //            foreach (var session in sessionUser)
        //            {
        //                if (session.ChkoutTime.HasValue)
        //                {
        //                    timeWorking += session.ChkoutTime.Value.Subtract(session.ChkinTime.Value).TotalSeconds;
        //                    timeSheet.Detail += "[" + session.ChkinTime.Value.ToString("dd/MM/yyyy HH:mm:ss") + (!session.ChkoutTime.HasValue ? ("_") : ("_" + session.ChkoutTime.Value.ToString("HH:mm:ss dd/MM/yyyy"))) + "], ";
        //                }
        //            }
        //            TimeSpan time = TimeSpan.FromSeconds(timeWorking);
        //            var hours = time.Days * 24 + time.Hours;
        //            var minutes = time.Minutes;
        //            var seconds = time.Seconds;
        //            timeSheet.ID = item.First().Id;
        //            timeSheet.UserName = item.First().CreatedBy;
        //            timeSheet.TimeWorking = string.Format("{0}:{1}:{2}", hours, minutes, seconds);
        //            listTimeWorking.Add(timeSheet);
        //        }
        //    }
        //    var count = listTimeWorking.Count();
        //    var data = listTimeWorking.Skip(intBeginFor).Take(jTablepara.Length).ToList();
        //    var jdata = JTableHelper.JObjectTable(data, jTablepara.Draw, count, "ID", "UserName", "TimeWorking", "Detail");
        //    return Json(jdata);
        //}

        //Time working from date to date
        public ActionResult ExportExcel(string uId, string fromDate, string toDate)
        {
            var today = DateTime.Today;
            var fromTime = !string.IsNullOrEmpty(fromDate) ? DateTime.ParseExact(fromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toTime = !string.IsNullOrEmpty(toDate) ? DateTime.ParseExact(toDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            if (fromTime == null && toTime == null)
            {
                fromTime = today;
                toTime = today;
            }
            var listTimeWorking = new List<TimeWorkingSheet>();
            if (!string.IsNullOrEmpty(uId))
            {
                var query = (from a in _context.ShiftLogs.Where(x => x.ChkoutTime.HasValue)
                             where ((fromTime == null) || (a.ChkinTime.Value.Date >= fromTime.Value.Date))
                             && ((toTime == null) || ((a.ChkoutTime.HasValue ? a.ChkoutTime.Value.Date : DateTime.Now.Date) <= toTime.Value.Date))
                             && (string.IsNullOrEmpty(uId) || a.CreatedBy.Equals(uId))
                             select new
                             {
                                 a.Id,
                                 a.ShiftCode,
                                 a.CreatedBy,
                                 a.ChkinTime,
                                 a.ChkoutTime
                             }).GroupBy(x => x.ChkoutTime.Value.Date);
                if (query.Any())
                {
                    var index = 1;
                    foreach (var item in query)
                    {
                        double timeWorking = 0;
                        var timeSheet = new TimeWorkingSheet();
                        var sessionUser = item.DistinctBy(x => x.ShiftCode).ToList();
                        foreach (var session in sessionUser)
                        {
                            if (session.ChkoutTime.HasValue)
                            {
                                timeWorking += session.ChkoutTime.Value.Subtract(session.ChkinTime.Value).TotalSeconds;
                                timeSheet.Detail += "[" + session.ChkinTime.Value.ToString("dd/MM/yyyy HH:mm:ss") + (!session.ChkoutTime.HasValue ? ("_") : ("_" + session.ChkoutTime.Value.ToString("dd/MM/yyyy HH:mm:ss"))) + "], ";
                            }
                        }
                        if (item.FirstOrDefault().ChkoutTime.HasValue)
                            timeSheet.DateWorking = item.FirstOrDefault().ChkoutTime.Value.ToString("dd/MM/yyyy");

                        TimeSpan time = TimeSpan.FromSeconds(timeWorking);
                        var hours = time.Days * 24 + time.Hours;
                        var minutes = time.Minutes;
                        var seconds = time.Seconds;
                        timeSheet.ID = index;
                        timeSheet.UserName = item.First().CreatedBy;

                        var user = _context.Users.FirstOrDefault(x => x.UserName == item.First().CreatedBy);

                        timeSheet.GivenName = user != null ? user.GivenName : "";

                        timeSheet.TimeWorking = string.Format("{0}:{1}:{2}", hours, minutes, seconds);

                        listTimeWorking.Add(timeSheet);
                        index++;
                    }
                }
            }
            else
            {
                var query = (from a in _context.ShiftLogs.Where(x => x.ChkoutTime.HasValue)
                             where ((fromTime == null) || (a.ChkinTime.Value.Date >= fromTime.Value.Date))
                             && ((toTime == null) || ((a.ChkoutTime.HasValue ? a.ChkoutTime.Value.Date : DateTime.Now.Date) <= toTime.Value.Date))
                             && (string.IsNullOrEmpty(uId) || a.CreatedBy.Equals(uId))
                             select new
                             {
                                 a.Id,
                                 a.ShiftCode,
                                 a.CreatedBy,
                                 a.ChkinTime,
                                 a.ChkoutTime
                             }).GroupBy(x => x.CreatedBy);

                if (query.Any())
                {
                    var index = 1;
                    foreach (var item in query)
                    {
                        double timeWorking = 0;
                        var countShift = 0;
                        var timeSheet = new TimeWorkingSheet();
                        var sessionUser = item.DistinctBy(x => x.ShiftCode).ToList();
                        foreach (var session in sessionUser)
                        {
                            if (session.ChkoutTime.HasValue)
                            {
                                timeWorking += session.ChkoutTime.Value.Subtract(session.ChkinTime.Value).TotalSeconds;
                                //timeSheet.Detail += "[" + session.ChkinTime.Value.ToString("dd/MM/yyyy HH:mm:ss") + (!session.ChkoutTime.HasValue ? ("_") : ("_" + session.ChkoutTime.Value.ToString("HH:mm:ss dd/MM/yyyy"))) + "], ";
                                countShift++;
                            }
                        }
                        if (item.FirstOrDefault().ChkoutTime.HasValue)
                        {
                            if (item.FirstOrDefault().ChkoutTime.Value.Date != item.LastOrDefault().ChkoutTime.Value.Date)
                            {
                                if (string.IsNullOrEmpty(fromDate) && string.IsNullOrEmpty(toDate))
                                {
                                    timeSheet.DateWorking = item.FirstOrDefault().ChkoutTime.Value.ToString("dd/MM/yyyy") + " đến " + item.LastOrDefault().ChkoutTime.Value.ToString("dd/MM/yyyy");
                                }
                                else if (!string.IsNullOrEmpty(fromDate) && string.IsNullOrEmpty(toDate))
                                {
                                    timeSheet.DateWorking = fromTime.Value.ToString("dd/MM/yyyy") + " đến " + item.LastOrDefault().ChkoutTime.Value.ToString("dd/MM/yyyy");
                                }
                                else if (string.IsNullOrEmpty(fromDate) && !string.IsNullOrEmpty(toDate))
                                {
                                    timeSheet.DateWorking = item.FirstOrDefault().ChkoutTime.Value.ToString("dd/MM/yyyy") + " đến " + toTime.Value.ToString("dd/MM/yyyy");
                                }
                                else
                                {
                                    timeSheet.DateWorking = fromTime.Value.ToString("dd/MM/yyyy") + " đến " + toTime.Value.ToString("dd/MM/yyyy");
                                }
                            }
                            else
                            {
                                if (string.IsNullOrEmpty(fromDate) && string.IsNullOrEmpty(toDate))
                                {
                                    timeSheet.DateWorking = item.FirstOrDefault().ChkoutTime.Value.ToString("dd/MM/yyyy");
                                }
                                else if (!string.IsNullOrEmpty(fromDate) && string.IsNullOrEmpty(toDate))
                                {
                                    timeSheet.DateWorking = fromTime.Value.ToString("dd/MM/yyyy") + " đến " + item.LastOrDefault().ChkoutTime.Value.ToString("dd/MM/yyyy");
                                }
                                else if (string.IsNullOrEmpty(fromDate) && !string.IsNullOrEmpty(toDate))
                                {
                                    timeSheet.DateWorking = item.FirstOrDefault().ChkoutTime.Value.ToString("dd/MM/yyyy") + " đến " + toTime.Value.ToString("dd/MM/yyyy");
                                }
                                else
                                {
                                    timeSheet.DateWorking = fromTime.Value.ToString("dd/MM/yyyy") + " đến " + toTime.Value.ToString("dd/MM/yyyy");
                                }
                            }

                        }
                        TimeSpan time = TimeSpan.FromSeconds(timeWorking);
                        var hours = time.Days * 24 + time.Hours;
                        var minutes = time.Minutes;
                        var seconds = time.Seconds;
                        timeSheet.ID = index;
                        timeSheet.UserName = item.First().CreatedBy;

                        var user = _context.Users.FirstOrDefault(x => x.UserName == item.First().CreatedBy);

                        timeSheet.GivenName = user != null ? user.GivenName : "";

                        timeSheet.TimeWorking = string.Format("{0}:{1}:{2}", hours, minutes, seconds);
                        timeSheet.Detail = string.Format("Số ca: {0}", countShift);
                        listTimeWorking.Add(timeSheet);
                        index++;
                    }
                }
            }
            ExcelEngine excelEngine = new ExcelEngine();
            IApplication application = excelEngine.Excel;
            application.DefaultVersion = ExcelVersion.Excel2010;
            IWorkbook workbook = application.Workbooks.Create(1);
            workbook.Version = ExcelVersion.Excel97to2003;
            IWorksheet sheetRequest = workbook.Worksheets.Create("Time Working");
            workbook.Worksheets[0].Remove();
            IMigrantRange migrantRange = workbook.Worksheets[0].MigrantRange;
            sheetRequest.Range["A1"].ColumnWidth = 24;
            sheetRequest.Range["B1"].ColumnWidth = 24;
            sheetRequest.Range["C1"].ColumnWidth = 24;
            sheetRequest.Range["D1"].ColumnWidth = 24;

            sheetRequest.Range["A1:F1"].Merge(true);

            sheetRequest.Range["A1"].Text = "Thời gian làm việc";
            sheetRequest.Range["A1"].CellStyle.Font.FontName = "Calibri";
            sheetRequest.Range["A1"].CellStyle.Font.Bold = true;
            sheetRequest.Range["A1"].CellStyle.Font.Size = 24;
            //sheetRequest.Range["A1"].CellStyle.Font.RGBColor = Color.FromArgb(0, 0, 176, 240);
            sheetRequest.Range["A1"].HorizontalAlignment = ExcelHAlign.HAlignCenter;

            sheetRequest.ImportData(listTimeWorking, 2, 1, true);

            sheetRequest["A2"].Text = "STT";
            sheetRequest["B2"].Text = "Tài khoản";
            sheetRequest["C2"].Text = "Tên nhân viên";
            sheetRequest["D2"].Text = "Ngày tạo";
            sheetRequest["E2"].Text = "Tổng số giờ làm";
            sheetRequest["F2"].Text = "Chi tiết";

            IStyle tableHeader = workbook.Styles.Add("TableHeaderStyle");
            tableHeader.Font.Color = ExcelKnownColors.Black;
            tableHeader.Font.Bold = true;
            tableHeader.Font.Size = 11;
            tableHeader.Font.FontName = "Calibri";
            tableHeader.HorizontalAlignment = ExcelHAlign.HAlignCenter;
            tableHeader.VerticalAlignment = ExcelVAlign.VAlignCenter;
            tableHeader.Color = Color.FromArgb(0, 0, 122, 192);
            tableHeader.Borders[ExcelBordersIndex.EdgeRight].LineStyle = ExcelLineStyle.None;
            tableHeader.Borders[ExcelBordersIndex.EdgeTop].LineStyle = ExcelLineStyle.None;
            tableHeader.Borders[ExcelBordersIndex.EdgeBottom].LineStyle = ExcelLineStyle.None;
            tableHeader.Borders[ExcelBordersIndex.EdgeBottom].LineStyle = ExcelLineStyle.None;
            sheetRequest["A2:F2"].CellStyle = tableHeader;
            sheetRequest.Range["A2:F2"].RowHeight = 20;
            sheetRequest.UsedRange.AutofitColumns();

            string ContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            var fileName = "ExportStaffTime" + DateTime.Now.ToString("yyyyMMddHHmmss") + ".xls";
            MemoryStream ms = new MemoryStream();
            workbook.SaveAs(ms);
            workbook.Close();
            excelEngine.Dispose();
            ms.Position = 0;
            return File(ms, ContentType, fileName);
        }

        //[HttpPost]
        //public JsonResult JtableTimeWorking([FromBody] TimeWorkingSheetModel jTablepara)
        //{
        //    int intBeginFor = (jTablepara.CurrentPage - 1) * jTablepara.Length;
        //    var today = DateTime.Today;
        //    var fromTime = !string.IsNullOrEmpty(jTablepara.FromDate) ? DateTime.ParseExact(jTablepara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
        //    var toTime = !string.IsNullOrEmpty(jTablepara.ToDate) ? DateTime.ParseExact(jTablepara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
        //    if (fromTime == null && toTime == null)
        //    {
        //        fromTime = today;
        //        toTime = today;
        //    }
        //    var query = (from a in _context.ShiftLogs
        //                 where (string.IsNullOrEmpty(jTablepara.UserId) || a.CreatedBy.Equals(jTablepara.UserId))
        //                  && ((fromTime == null) || (a.ChkinTime.Value.Date >= fromTime.Value.Date))
        //                 && ((toTime == null) || ((a.ChkoutTime.HasValue ? a.ChkoutTime.Value.Date : DateTime.Now.Date) <= toTime.Value.Date))
        //                 select new
        //                 {
        //                     a.Id,
        //                     a.ShiftCode,
        //                     a.CreatedBy,
        //                     a.ChkinTime,
        //                     a.ChkoutTime
        //                 }).GroupBy(x => x.CreatedBy);
        //    var listTimeWorking = new List<TimeWorkingSheet>();
        //    if (query.Any())
        //    {
        //        foreach (var item in query)
        //        {
        //            double timeWorking = 0;
        //            var timeSheet = new TimeWorkingSheet();
        //            var sessionUser = item.DistinctBy(x => x.ShiftCode).ToList();
        //            foreach (var session in sessionUser)
        //            {
        //                if (session.ChkoutTime.HasValue)
        //                {
        //                    timeWorking += session.ChkoutTime.Value.Subtract(session.ChkinTime.Value).TotalSeconds;
        //                    timeSheet.Detail += "[" + session.ChkinTime.Value.ToString("dd/MM/yyyy HH:mm:ss") + (!session.ChkoutTime.HasValue ? ("_") : ("_" + session.ChkoutTime.Value.ToString("HH:mm:ss dd/MM/yyyy"))) + "], ";
        //                }
        //            }
        //            TimeSpan time = TimeSpan.FromSeconds(timeWorking);
        //            var hours = time.Days * 24 + time.Hours;
        //            var minutes = time.Minutes;
        //            var seconds = time.Seconds;
        //            timeSheet.ID = item.First().Id;
        //            timeSheet.UserName = item.First().CreatedBy;
        //            timeSheet.TimeWorking = string.Format("{0}:{1}:{2}", hours, minutes, seconds);
        //            listTimeWorking.Add(timeSheet);
        //        }
        //    }
        //    var count = listTimeWorking.Count();
        //    var data = listTimeWorking.Skip(intBeginFor).Take(jTablepara.Length).ToList();
        //    var jdata = JTableHelper.JObjectTable(data, jTablepara.Draw, count, "ID", "UserName", "TimeWorking", "Detail");
        //    return Json(jdata);
        //}

        [HttpPost]
        public JsonResult JtableTimeWorking([FromBody] TimeWorkingSheetModel jTablepara)
        {
            int intBeginFor = (jTablepara.CurrentPage - 1) * jTablepara.Length;
            var today = DateTime.Today;
            var fromTime = !string.IsNullOrEmpty(jTablepara.FromDate) ? DateTime.ParseExact(jTablepara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toTime = !string.IsNullOrEmpty(jTablepara.ToDate) ? DateTime.ParseExact(jTablepara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            if (fromTime == null && toTime == null)
            {
                fromTime = today;
                toTime = today;
            }
            if (!string.IsNullOrEmpty(jTablepara.UserId))
            {
                var query = (from a in _context.ShiftLogs.Where(x => x.ChkoutTime.HasValue)
                             where ((fromTime == null) || (a.ChkinTime.Value.Date >= fromTime.Value.Date))
                             && ((toTime == null) || ((a.ChkoutTime.HasValue ? a.ChkoutTime.Value.Date : DateTime.Now.Date) <= toTime.Value.Date))
                             && (string.IsNullOrEmpty(jTablepara.UserId) || a.CreatedBy.Equals(jTablepara.UserId))
                             select new
                             {
                                 a.Id,
                                 a.ShiftCode,
                                 a.CreatedBy,
                                 a.ChkinTime,
                                 a.ChkoutTime
                             }).GroupBy(x => x.ChkoutTime.Value.Date);
                var listTimeWorking = new List<TimeWorkingSheet>();
                if (query.Any())
                {
                    foreach (var item in query)
                    {
                        double timeWorking = 0;
                        var timeSheet = new TimeWorkingSheet();
                        var sessionUser = item.DistinctBy(x => x.ShiftCode).ToList();
                        foreach (var session in sessionUser)
                        {
                            if (session.ChkoutTime.HasValue)
                            {
                                timeWorking += session.ChkoutTime.Value.Subtract(session.ChkinTime.Value).TotalSeconds;
                                timeSheet.Detail += "[" + session.ChkinTime.Value.ToString("dd/MM/yyyy HH:mm:ss") + (!session.ChkoutTime.HasValue ? ("_") : ("_" + session.ChkoutTime.Value.ToString("dd/MM/yyyy HH:mm:ss"))) + "], ";
                            }
                        }
                        if (item.FirstOrDefault().ChkoutTime.HasValue)
                            timeSheet.DateWorking = item.FirstOrDefault().ChkoutTime.Value.ToString("dd/MM/yyyy");

                        TimeSpan time = TimeSpan.FromSeconds(timeWorking);
                        var hours = time.Days * 24 + time.Hours;
                        var minutes = time.Minutes;
                        var seconds = time.Seconds;
                        timeSheet.ID = item.First().Id;
                        timeSheet.UserName = item.First().CreatedBy;

                        var user = _context.Users.FirstOrDefault(x => x.UserName == item.First().CreatedBy);

                        timeSheet.GivenName = user != null ? user.GivenName : "";
                        timeSheet.TimeWorking = string.Format("{0}:{1}:{2}", hours, minutes, seconds);

                        listTimeWorking.Add(timeSheet);
                    }
                }
                var count = listTimeWorking.Count();
                var data = listTimeWorking.Skip(intBeginFor).Take(jTablepara.Length).ToList();
                var jdata = JTableHelper.JObjectTable(data, jTablepara.Draw, count, "ID", "UserName", "GivenName", "DateWorking", "TimeWorking", "Detail");
                return Json(jdata);
            }
            else
            {
                var query = (from a in _context.ShiftLogs.Where(x => x.ChkoutTime.HasValue)
                             where ((fromTime == null) || (a.ChkinTime.Value.Date >= fromTime.Value.Date))
                             && ((toTime == null) || ((a.ChkoutTime.HasValue ? a.ChkoutTime.Value.Date : DateTime.Now.Date) <= toTime.Value.Date))
                             && (string.IsNullOrEmpty(jTablepara.UserId) || a.CreatedBy.Equals(jTablepara.UserId))
                             select new
                             {
                                 a.Id,
                                 a.ShiftCode,
                                 a.CreatedBy,
                                 a.ChkinTime,
                                 a.ChkoutTime
                             }).GroupBy(x => x.CreatedBy);
                var listTimeWorking = new List<TimeWorkingSheet>();
                if (query.Any())
                {
                    foreach (var item in query)
                    {
                        double timeWorking = 0;
                        var countShift = 0;
                        var timeSheet = new TimeWorkingSheet();
                        var sessionUser = item.DistinctBy(x => x.ShiftCode).ToList();
                        foreach (var session in sessionUser)
                        {
                            if (session.ChkoutTime.HasValue)
                            {
                                timeWorking += session.ChkoutTime.Value.Subtract(session.ChkinTime.Value).TotalSeconds;
                                //timeSheet.Detail += "[" + session.ChkinTime.Value.ToString("dd/MM/yyyy HH:mm:ss") + (!session.ChkoutTime.HasValue ? ("_") : ("_" + session.ChkoutTime.Value.ToString("HH:mm:ss dd/MM/yyyy"))) + "], ";
                                countShift++;
                            }
                        }
                        if (item.FirstOrDefault().ChkoutTime.HasValue)
                        {
                            if (item.FirstOrDefault().ChkoutTime.Value.Date != item.LastOrDefault().ChkoutTime.Value.Date)
                            {
                                if (string.IsNullOrEmpty(jTablepara.FromDate) && string.IsNullOrEmpty(jTablepara.ToDate))
                                {
                                    timeSheet.DateWorking = item.FirstOrDefault().ChkoutTime.Value.ToString("dd/MM/yyyy") + " đến " + item.LastOrDefault().ChkoutTime.Value.ToString("dd/MM/yyyy");
                                }
                                else if (!string.IsNullOrEmpty(jTablepara.FromDate) && string.IsNullOrEmpty(jTablepara.ToDate))
                                {
                                    timeSheet.DateWorking = fromTime.Value.ToString("dd/MM/yyyy") + " đến " + item.LastOrDefault().ChkoutTime.Value.ToString("dd/MM/yyyy");
                                }
                                else if (string.IsNullOrEmpty(jTablepara.FromDate) && !string.IsNullOrEmpty(jTablepara.ToDate))
                                {
                                    timeSheet.DateWorking = item.FirstOrDefault().ChkoutTime.Value.ToString("dd/MM/yyyy") + " đến " + toTime.Value.ToString("dd/MM/yyyy");
                                }
                                else
                                {
                                    timeSheet.DateWorking = fromTime.Value.ToString("dd/MM/yyyy") + " đến " + toTime.Value.ToString("dd/MM/yyyy");
                                }
                            }
                            else
                            {
                                if (string.IsNullOrEmpty(jTablepara.FromDate) && string.IsNullOrEmpty(jTablepara.ToDate))
                                {
                                    timeSheet.DateWorking = item.FirstOrDefault().ChkoutTime.Value.ToString("dd/MM/yyyy");
                                }
                                else if (!string.IsNullOrEmpty(jTablepara.FromDate) && string.IsNullOrEmpty(jTablepara.ToDate))
                                {
                                    timeSheet.DateWorking = fromTime.Value.ToString("dd/MM/yyyy") + " đến " + item.LastOrDefault().ChkoutTime.Value.ToString("dd/MM/yyyy");
                                }
                                else if (string.IsNullOrEmpty(jTablepara.FromDate) && !string.IsNullOrEmpty(jTablepara.ToDate))
                                {
                                    timeSheet.DateWorking = item.FirstOrDefault().ChkoutTime.Value.ToString("dd/MM/yyyy") + " đến " + toTime.Value.ToString("dd/MM/yyyy");
                                }
                                else
                                {
                                    timeSheet.DateWorking = fromTime.Value.ToString("dd/MM/yyyy") + " đến " + toTime.Value.ToString("dd/MM/yyyy");
                                }
                            }

                        }

                        TimeSpan time = TimeSpan.FromSeconds(timeWorking);
                        var hours = time.Days * 24 + time.Hours;
                        var minutes = time.Minutes;
                        var seconds = time.Seconds;
                        timeSheet.ID = item.First().Id;
                        timeSheet.UserName = item.First().CreatedBy;

                        var user = _context.Users.FirstOrDefault(x => x.UserName == item.First().CreatedBy);

                        timeSheet.GivenName = user != null ? user.GivenName : "";

                        timeSheet.TimeWorking = string.Format("{0}:{1}:{2}", hours, minutes, seconds);
                        timeSheet.Detail = string.Format("Số ca: {0}", countShift);

                        listTimeWorking.Add(timeSheet);
                    }
                }
                var count = listTimeWorking.Count();
                var data = listTimeWorking.Skip(intBeginFor).Take(jTablepara.Length).ToList();
                var jdata = JTableHelper.JObjectTable(data, jTablepara.Draw, count, "ID", "UserName", "GivenName", "DateWorking", "TimeWorking", "Detail");
                return Json(jdata);
            }
        }


        [NonAction]
        public string GenerateShiftCode(string uId)
        {
            var monthNow = DateTime.Now.Month;
            var yearNow = DateTime.Now.Year;
            var reqCode = string.Empty;
            var no = 1;
            var noText = "01";
            var data1 = _context.WorkShiftCheckInOuts.Where(x => x.CreatedTime.Year == yearNow && x.CreatedTime.Month == monthNow).ToList();
            var data = _context.Users.FirstOrDefault(x => x.Id.Equals(uId));
            if (data1.Count > 0)
            {
                no = data1.Count + 1;
                if (no < 10)
                {
                    noText = "0" + no;
                }
                else
                {
                    noText = no.ToString();
                }
            }

            reqCode = string.Format("{0}{1}{2}", "SHIFT_", data.UserName + "_", noText);

            return reqCode;
        }

        [NonAction]
        public string GetShiftCode(string uId)
        {
            string shifCode = "";
            var id = _context.WorkShiftCheckInOuts.Where(x => x.UserId.Equals(uId) && !x.IsDeleted).Max(x => x.Id);
            var data = _context.WorkShiftCheckInOuts.FirstOrDefault(x => x.Id == id);
            if (data.Action == EnumHelper<StaffStauts>.GetDisplayValue(StaffStauts.CheckIn))
            {
                shifCode = data.ShiftCode;

            }
            return shifCode;
        }

        [HttpPost]
        public JsonResult GetAllShiftOfUser(string userName)
        {
            //var session = HttpContext.GetSessionUser();
            var shifts = _context.ShiftLogs.Where(x => x.CreatedBy == userName).OrderByDescending(x => x.ChkinTime).ThenByDescending(x => x.ChkoutTime);
            return Json(shifts);
        }
        [HttpPost]
        public ShiftLogTemp GetLastShiftLog()
        {
            var session = HttpContext.GetSessionUser();
            var shiftTemp = new ShiftLogTemp();
            var data = _context.ShiftLogs.LastOrDefault(x => x.CreatedBy == session.UserName && x.Flag != "DELETED" && x.Flag != "CANCEL");

            if (data != null)
            {
                var getShiftBefore = _context.ShiftLogs.LastOrDefault(x => x.CreatedBy == session.UserName && x.Flag != "DELETED" && x.Flag != "CANCEL" && x.Id < data.Id);
                shiftTemp.ShiftCode = data.ShiftCode;
                shiftTemp.ChkoutTime = data.ChkoutTime;
                shiftTemp.ChkinTime = data.ChkinTime;
                shiftTemp.ChkinLocationTxt = data.ChkinLocationTxt;
                shiftTemp.ChkoutLocationTxt = data.ChkoutLocationTxt;
                if (getShiftBefore != null)
                {
                    shiftTemp.ShiftCodeBefore = "[ In: " + getShiftBefore.ChkinTime.Value.ToString("HH:mm:ss dd/MM/yyyy") + ", Out: " + (getShiftBefore.ChkoutTime.HasValue ? getShiftBefore.ChkoutTime.Value.ToString("HH:mm:ss dd/MM/yyyy") : "") + "]";
                }
                else
                {
                    shiftTemp.ShiftCodeBefore = "[Chưa có ca làm việc trước đây]";
                }

                if (data.ChkoutTime == null)
                    shiftTemp.IsCheckIn = true;
            }
            else
            {
                shiftTemp.IsCheckIn = false;
            }
            return shiftTemp;
        }

        public class TimeWorkingSheet
        {
            public int ID { get; set; }
            public string UserName { get; set; }
            public string GivenName { get; set; }
            public string DateWorking { get; set; }
            public string TimeWorking { get; set; }
            public string Detail { get; set; }
        }
        public class TimeWorkingSheetModel : JTableModel
        {
            public int ID { get; set; }
            public string UserName { get; set; }
            public string UserId { get; set; }
            public string TimeWorking { get; set; }
            public string Detail { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
        }

        public class ShiftLogModel
        {
            public string ShiftCode { get; set; }
            public double Lat { get; set; }
            public double Lon { get; set; }
        }
        public class ShiftLogManual
        {
            public string ShiftCode { get; set; }
            public string ChkinLocationTxt { get; set; }
            public string ChkoutLocationTxt { get; set; }
            public string ChkinTime { get; set; }
            public string ChkoutTime { get; set; }
            public string ChkinPicRealtime { get; set; }
            public string ChkoutPicRealtime { get; set; }
            public string Note { get; set; }
            public bool IsChkinRealtime { get; set; }
        }

        public class ShiftLogTemp
        {
            public int Id { get; set; }
            public string ShiftCode { get; set; }
            public DateTime? ChkinTime { get; set; }
            public string ChkinLocationTxt { get; set; }
            public string ChkinLocationGps { get; set; }
            public string ChkinPicRealtime { get; set; }
            public bool IsChkinRealtime { get; set; }
            public DateTime? ChkoutTime { get; set; }
            public string ChkoutLocationTxt { get; set; }
            public string ChkoutLocationGps { get; set; }
            public string ChkoutPicRealtime { get; set; }
            public bool IsChkoutReadtime { get; set; }
            public string Note { get; set; }
            public string CreatedBy { get; set; }
            public DateTime? CreatedTime { get; set; }
            public string UpdatedBy { get; set; }
            public DateTime? UpdatedTime { get; set; }
            public string Flag { get; set; }
            public string FromDevice { get; set; }
            public string Ip { get; set; }
            public string Imei { get; set; }
            public bool IsCheckIn { get; set; }
            public string ShiftCodeBefore { get; set; }
        }
        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value }).Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }
        #endregion
    }
}