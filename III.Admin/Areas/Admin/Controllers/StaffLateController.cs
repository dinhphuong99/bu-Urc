using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using System.IO;
using III.Domain.Enums;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class StaffLateController : BaseController
    {
        public class SStaffTimeKeepingJtableModel : JTableModel
        {
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string UserId { get; set; }
            public string Status { get; set; }
        }
        private readonly EIMDBContext _context;
        private readonly IGoogleAPIService _googleAPI;
        private readonly IUploadService _upload;
        private readonly IStringLocalizer<StaffLateController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;

        public StaffLateController(EIMDBContext context, IGoogleAPIService googleAPI, IUploadService upload, IStringLocalizer<StaffLateController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _googleAPI = googleAPI;
            _upload = upload;
            _sharedResources = sharedResources;
            _stringLocalizer = stringLocalizer;
        }
        public IActionResult Index()
        {
            return View();
        }
        [HttpPost]
        public object JTable([FromBody]SStaffTimeKeepingJtableModel jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var today = DateTime.Today;
            var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            if(fromDate == null && toDate == null)
            {
                fromDate = today;
                toDate = today;
            }

            var query = (from a in _context.WorkShiftCheckInOuts
                         join b in _context.Users on a.UserId equals b.Id
                         where (a.Action == EnumHelper<StaffStauts>.GetDisplayValue(StaffStauts.GoLate)
                         || a.Action == EnumHelper<StaffStauts>.GetDisplayValue(StaffStauts.QuitWork)
                         || a.Action == EnumHelper<StaffStauts>.GetDisplayValue(StaffStauts.NoWork))
                         && (string.IsNullOrEmpty(jTablePara.Status) || a.Action == jTablePara.Status)
                         && ((fromDate == null) || ((a.Action == EnumHelper<StaffStauts>.GetDisplayValue(StaffStauts.NoWork) && (a.ActionTo >= fromDate.Value.Date))
                                                    || (a.Action != EnumHelper<StaffStauts>.GetDisplayValue(StaffStauts.NoWork) && (a.ActionTime.Date >= fromDate.Value.Date))
                                                    ))
                           && ((toDate == null) || ((a.Action == EnumHelper<StaffStauts>.GetDisplayValue(StaffStauts.NoWork) && (toDate.Value.Date >= a.ActionTime.Date))
                                                    || (a.Action != EnumHelper<StaffStauts>.GetDisplayValue(StaffStauts.NoWork) && (a.ActionTime.Date <= toDate.Value.Date))))
                         && ((string.IsNullOrEmpty(jTablePara.UserId)) || (a.UserId == jTablePara.UserId))
                         select new
                         {
                             a.Id,
                             a.UserId,
                             FullName = b.GivenName,
                             b.Picture,
                             a.Action,
                             a.ActionTime,
                             a.ActionTo,
                             a.Note,
                             a.LocationText
                         });
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Select(x => new
            {
                x.Id,
                x.UserId,
                x.FullName,
                x.Picture,
                Status = (x.Action == EnumHelper<StaffStauts>.GetDisplayValue(StaffStauts.GoLate) ? StaffStauts.GoLate.DescriptionAttr() :
                         x.Action == EnumHelper<StaffStauts>.GetDisplayValue(StaffStauts.NoWork) ? StaffStauts.NoWork.DescriptionAttr() :
                         x.Action == EnumHelper<StaffStauts>.GetDisplayValue(StaffStauts.QuitWork) ? StaffStauts.QuitWork.DescriptionAttr() : ""),
                ActionTime = (x.Action == EnumHelper<StaffStauts>.GetDisplayValue(StaffStauts.GoLate) ? x.ActionTime.ToString("dd/MM/yyyy HH:mm") :/* x.ActionTime.ToString("dd/MM/yyyy hh:mm:ss") :*/
                              x.Action == EnumHelper<StaffStauts>.GetDisplayValue(StaffStauts.NoWork) ? string.Concat(x.ActionTime.ToString("dd/MM/yyyy"), "-", x.ActionTo.Value.ToString("dd/MM/yyyy")) :
                              x.Action == EnumHelper<StaffStauts>.GetDisplayValue(StaffStauts.QuitWork) ? x.ActionTime.ToString("dd/MM/yyyy") : ""),
                x.LocationText,
                x.Note
            }).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "UserId", "FullName", "Picture", "Status", "ActionTime", "LocationText", "Note");
            return Json(jdata);
        }


        [HttpGet]
        public JsonResult GetAllTotal(string memberId, int month, int year, string from, string to)
        {
            var msg = new JMessage { Error = false, Title = "" };
            var user = _context.Users.FirstOrDefault(x => x.Active && x.Id == memberId);
            try
            {
                var listTotal = new List<StatisticalTotal>();
                var fromDate = !string.IsNullOrEmpty(from) ? DateTime.ParseExact(from, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var toDate = !string.IsNullOrEmpty(to) ? DateTime.ParseExact(to, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var listDateInMonth = DateTimeExtensions.GetDates(year, month).Where(x => x.Date <= DateTime.Today);
                //Select all
                if (string.IsNullOrEmpty(memberId))
                {
                    if (fromDate == null && toDate == null)
                    {
                        foreach (var item in listDateInMonth)
                        {
                            var totalLate = GetCountUserLate(item, "");
                            var statistical = new StatisticalTotal
                            {
                                Date = item,
                                CountLate = totalLate,
                            };
                            listTotal.Add(statistical);
                        }
                        msg.Object = new
                        {
                            All = true,
                            ListTotal = listTotal,
                        };
                    }
                    else
                    {
                        for (DateTime date = fromDate.Value; date <= toDate; date = date.AddDays(1))
                        {
                            var totalLate = GetCountUserLate(date, "");
                            var statistical = new StatisticalTotal
                            {
                                Date = date,
                                CountLate = totalLate,
                            };
                            listTotal.Add(statistical);
                        }
                        msg.Object = new
                        {
                            All = true,
                            ListTotal = listTotal,
                        };
                    }
                }
                //select memeberId
                else
                {
                    if (fromDate == null && toDate == null)
                    {
                        foreach (var item in listDateInMonth)
                        {
                            var totalLate = GetCountUserLate(item, memberId);
                            //var totalReal = _context.ShiftLogs.Where(x => x.ChkinTime.Value.Date == item.Date && x.CreatedBy == user.UserName).DistinctBy(x => x.CreatedBy).Count();
                            var statistical = new StatisticalTotal
                            {
                                Date = item,
                                //CountRegistration = 0,
                                CountLate = totalLate,
                                //CountReal = totalReal
                            };
                            listTotal.Add(statistical);
                        }
                        msg.Object = new
                        {
                            All = false,
                            ListTotal = listTotal,
                        };
                    }
                    else
                    {
                        for (DateTime date = fromDate.Value; date <= toDate; date = date.AddDays(1))
                        {
                            var totalLate = GetCountUserLate(date, memberId);
                            //var totalReal = _context.ShiftLogs.Where(x => x.ChkinTime.Value.Date == date.Date && x.CreatedBy == user.UserName).DistinctBy(x => x.CreatedBy).Count();
                            var statistical = new StatisticalTotal
                            {
                                Date = date,
                                //CountRegistration = 0,
                                CountLate = totalLate,
                                //CountReal = totalReal
                            };
                            listTotal.Add(statistical);
                        }
                        msg.Object = new
                        {
                            All = false,
                            ListTotal = listTotal,
                        };
                    }
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
        public JsonResult EventCalendar(string dateSearch, string memberId)
        {
            var date = DateTime.ParseExact(dateSearch, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            var userLate = (from a in _context.WorkShiftCheckInOuts
                            join b in _context.Users on a.UserId equals b.Id
                            where (a.Action == EnumHelper<StaffStauts>.GetDisplayValue(StaffStauts.GoLate)
                            || a.Action == EnumHelper<StaffStauts>.GetDisplayValue(StaffStauts.QuitWork)
                            || a.Action == EnumHelper<StaffStauts>.GetDisplayValue(StaffStauts.NoWork))
                            && ((date == null) || ((a.Action == EnumHelper<StaffStauts>.GetDisplayValue(StaffStauts.NoWork) && (a.ActionTo >= date.Date))
                                                       || (a.Action != EnumHelper<StaffStauts>.GetDisplayValue(StaffStauts.NoWork) && (a.ActionTime.Date >= date.Date))
                                                       ))
                              && ((date == null) || ((a.Action == EnumHelper<StaffStauts>.GetDisplayValue(StaffStauts.NoWork) && (date.Date >= a.ActionTime.Date))
                                                       || (a.Action != EnumHelper<StaffStauts>.GetDisplayValue(StaffStauts.NoWork) && (a.ActionTime.Date <= date.Date))))
                                                       && (string.IsNullOrEmpty(memberId) || a.UserId.Equals(memberId))
                            select new
                            {
                                a.Id,
                                a.UserId,
                                b.GivenName,
                                b.Picture,
                                a.Action,
                                a.ActionTime,
                                a.ActionTo,
                                a.Note,
                                a.LocationText
                            });
            var dataUserLate = userLate.Select(x => new
            {
                FullName = x.GivenName,
                Status = (x.Action == EnumHelper<StaffStauts>.GetDisplayValue(StaffStauts.GoLate) ? StaffStauts.GoLate.DescriptionAttr() :
                         x.Action == EnumHelper<StaffStauts>.GetDisplayValue(StaffStauts.NoWork) ? StaffStauts.NoWork.DescriptionAttr() :
                         x.Action == EnumHelper<StaffStauts>.GetDisplayValue(StaffStauts.QuitWork) ? StaffStauts.QuitWork.DescriptionAttr() : ""),
                ActionTime = (x.Action == EnumHelper<StaffStauts>.GetDisplayValue(StaffStauts.GoLate) ? x.ActionTime.ToString("dd/MM/yyyy HH:mm") :/* x.ActionTime.ToString("dd/MM/yyyy hh:mm:ss") :*/
                              x.Action == EnumHelper<StaffStauts>.GetDisplayValue(StaffStauts.NoWork) ? string.Concat(x.ActionTime.ToString("dd/MM/yyyy"), "-", x.ActionTo.Value.ToString("dd/MM/yyyy")) :
                              x.Action == EnumHelper<StaffStauts>.GetDisplayValue(StaffStauts.QuitWork) ? x.ActionTime.ToString("dd/MM/yyyy") : ""),
                LocationText = x.LocationText,
                UserId = x.UserId,
                Phone = _context.Users.FirstOrDefault(k => k.Id == x.UserId).PhoneNumber
            });
            return Json(dataUserLate);
        }
        [NonAction]
        public int GetCountUserLate(DateTime date, string memberId)
        {
            var query = (from a in _context.WorkShiftCheckInOuts
                         join b in _context.Users on a.UserId equals b.Id
                         where (a.Action == EnumHelper<StaffStauts>.GetDisplayValue(StaffStauts.GoLate)
                         || a.Action == EnumHelper<StaffStauts>.GetDisplayValue(StaffStauts.QuitWork)
                         || a.Action == EnumHelper<StaffStauts>.GetDisplayValue(StaffStauts.NoWork))
                         && ((date == null) || ((a.Action == EnumHelper<StaffStauts>.GetDisplayValue(StaffStauts.NoWork) && (a.ActionTo >= date.Date))
                                                    || (a.Action != EnumHelper<StaffStauts>.GetDisplayValue(StaffStauts.NoWork) && (a.ActionTime.Date >= date.Date))
                                                    ))
                           && ((date == null) || ((a.Action == EnumHelper<StaffStauts>.GetDisplayValue(StaffStauts.NoWork) && (date.Date >= a.ActionTime.Date))
                                                    || (a.Action != EnumHelper<StaffStauts>.GetDisplayValue(StaffStauts.NoWork) && (a.ActionTime.Date <= date.Date))))
                                                    && (string.IsNullOrEmpty(memberId) || a.UserId == memberId)
                         select new
                         {
                             a.Id,
                             a.UserId,
                             FullName = b.GivenName,
                             b.Picture,
                             a.Action,
                             a.ActionTime,
                             a.ActionTo,
                             a.Note,
                             a.LocationText
                         });
            return query.Count();
        }

        [HttpPost]
        public object GetJtableUserLate([FromBody]SStaffTimeKeepingJtableModel jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var today = DateTime.Today;
            if (string.IsNullOrEmpty(jTablePara.UserId))
            {
                return JTableHelper.JObjectTable(new List<object>(), jTablePara.Draw, 0, "Id", "Status", "ActionTime", "LocationText", "Note");
            }
            var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var query = (from a in _context.WorkShiftCheckInOuts
                         join b in _context.Users on a.UserId equals b.Id
                         where (a.Action == EnumHelper<StaffStauts>.GetDisplayValue(StaffStauts.GoLate)
                         || a.Action == EnumHelper<StaffStauts>.GetDisplayValue(StaffStauts.QuitWork)
                         || a.Action == EnumHelper<StaffStauts>.GetDisplayValue(StaffStauts.NoWork))
                         && a.UserId == jTablePara.UserId
                         select new
                         {
                             a.Id,
                             a.Picture,
                             a.Action,
                             a.ActionTime,
                             a.ActionTo,
                             a.Note,
                             a.LocationText,
                             a.Ip,
                             FullName = b.GivenName,
                         });
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).Select(x => new
            {
                x.Id,
                x.Action,
                x.Picture,
                Status = (x.Action == EnumHelper<StaffStauts>.GetDisplayValue(StaffStauts.GoLate) ? StaffStauts.GoLate.DescriptionAttr() :
                         x.Action == EnumHelper<StaffStauts>.GetDisplayValue(StaffStauts.NoWork) ? StaffStauts.NoWork.DescriptionAttr() :
                         x.Action == EnumHelper<StaffStauts>.GetDisplayValue(StaffStauts.QuitWork) ? StaffStauts.QuitWork.DescriptionAttr() : ""),
                x.ActionTime,
                x.ActionTo,
                Time = (x.Action == EnumHelper<StaffStauts>.GetDisplayValue(StaffStauts.GoLate) ? x.ActionTime.ToString("dd/MM/yyyy HH:mm") :
                              x.Action == EnumHelper<StaffStauts>.GetDisplayValue(StaffStauts.NoWork) ? string.Concat(x.ActionTime.ToString("dd/MM/yyyy"), "-", x.ActionTo.Value.ToString("dd/MM/yyyy")) :
                              x.Action == EnumHelper<StaffStauts>.GetDisplayValue(StaffStauts.QuitWork) ? x.ActionTime.ToString("dd/MM/yyyy") : ""),
                x.LocationText,
                x.Ip,
                x.Note,
                x.FullName
            }).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "Action", "Picture", "Status", "ActionTime", "ActionTo", "Time", "LocationText", "Ip", "Note", "FullName");
            return Json(jdata);
        }

        [HttpPost]
        public object GetItem([FromBody]int id)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            var data = _context.WorkShiftCheckInOuts.FirstOrDefault(x => x.Id == id);
            if (data != null)
            {
                var model = new SStaffTimeKeepingModel
                {
                    Id = id,
                    UserId = data.UserId,
                    Action = data.Action,
                    ActionTime = data.ActionTime.ToString("dd/MM/yyyy"),
                    ActionTo = data.ActionTo.HasValue ? data.ActionTo.Value.ToString("dd/MM/yyyy") : null,
                    Note = data.Note,
                };
                msg.Object = model;
            }
            else
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                //msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_NOT_EXITS_FILE"));
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetListStatus()
        {
            var list = new List<Properties>();
            var GoLate = new Properties
            {
                Code = EnumHelper<StaffStauts>.GetDisplayValue(StaffStauts.GoLate),
                Name = StaffStauts.GoLate.DescriptionAttr()
            };
            list.Add(GoLate);

            var NoWork = new Properties
            {
                Code = EnumHelper<StaffStauts>.GetDisplayValue(StaffStauts.NoWork),
                Name = StaffStauts.NoWork.DescriptionAttr()
            };
            list.Add(NoWork);

            var QuitWork = new Properties
            {
                Code = EnumHelper<StaffStauts>.GetDisplayValue(StaffStauts.QuitWork),
                Name = StaffStauts.QuitWork.DescriptionAttr()
            };
            list.Add(QuitWork);

            return Json(list);
        }

        [HttpGet]
        public object GetStaffLateOfUser(string userId)
        {
            return _context.WorkShiftCheckInOuts.Where(x => x.UserId == userId);
        }

        [HttpGet]
        public async Task<string> GetAddressForCoordinates(double latitude, double longitude)
        {
            return await _googleAPI.GetAddressForCoordinates(latitude, longitude);
        }

        [HttpPost]
        public JsonResult Add(SStaffTimeKeepingModel obj, IFormFile picture)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                if (ModelState.IsValid)
                {
                    var date = DateTime.Now;
                    var url = "";
                    if (picture != null)
                    {
                        var upload = _upload.UploadImage(picture);
                        if (!upload.Error)
                        {
                            url = Path.Combine("/uploads/images/", upload.Object.ToString());
                        }
                    }
                    if (obj.Action == EnumHelper<StaffStauts>.GetDisplayValue(StaffStauts.NoWork))
                    {
                        var actionTime = DateTime.ParseExact(obj.ActionTime, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                        var actionTo = DateTime.ParseExact(obj.ActionTo, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                        var checkExist = _context.WorkShiftCheckInOuts.FirstOrDefault(x => x.UserId == obj.UserId && x.Action == EnumHelper<StaffStauts>.GetDisplayValue(StaffStauts.NoWork) && (x.ActionTo >= actionTime && x.ActionTime <= actionTo));
                        if (checkExist == null)
                        {
                            var model = new WorkShiftCheckInOut
                            {
                                UserId = obj.UserId,
                                Action = obj.Action,
                                ActionTime = actionTime,
                                ActionTo = actionTo,
                                Note = obj.Note,
                                Device = "Laptop/Destop",
                                Picture = url,
                                LocationGPS = string.Format("[{0},{1}]", obj.Lat, obj.Lon),
                                LocationText = obj.LocationText,
                            };
                            _context.WorkShiftCheckInOuts.Add(model);
                            //msg.Title = String.Format(CommonUtil.ResourceValue("STL_MSG_ADD_SUCCES"));
                            msg.Title = _sharedResources["COM_ADD_SUCCESS"];
                            _context.SaveChanges();
                        }
                        else
                        {
                            msg.Error = true;
                            msg.Title = _stringLocalizer["STL_MSG_QUIT_IN_TIME"];
                        }
                    }
                    else if (obj.Action == EnumHelper<StaffStauts>.GetDisplayValue(StaffStauts.GoLate))
                    {
                        var actionTime = DateTime.ParseExact(obj.ActionTime, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture);
                        var checkExist = _context.WorkShiftCheckInOuts.FirstOrDefault(x => x.UserId == obj.UserId && x.ActionTime == actionTime && x.Action == EnumHelper<StaffStauts>.GetDisplayValue(StaffStauts.GoLate));
                        if (checkExist == null)
                        {
                            var model = new WorkShiftCheckInOut
                            {
                                UserId = obj.UserId,
                                Action = obj.Action,
                                Device = "Laptop/Destop",
                                ActionTime = actionTime,
                                Note = obj.Note,
                                Picture = url,
                                LocationGPS = string.Format("[{0},{1}]", obj.Lat, obj.Lon),
                                LocationText = obj.LocationText,
                            };
                            _context.WorkShiftCheckInOuts.Add(model);
                            //msg.Title = String.Format(CommonUtil.ResourceValue("STL_MSG_ADD_SUCCES"));
                            msg.Title = _stringLocalizer["COM_ADD_SUCCESS"];
                            _context.SaveChanges();
                        }
                        else
                        {
                            msg.Error = true;
                            msg.Title = _stringLocalizer["STL_MSG_LATE_IN_TIME"];
                        }
                    }
                    else if (obj.Action == EnumHelper<StaffStauts>.GetDisplayValue(StaffStauts.QuitWork))
                    {
                        var actionTime = DateTime.ParseExact(obj.ActionTime, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                        var checkExist = _context.WorkShiftCheckInOuts.FirstOrDefault(x => x.UserId == obj.UserId && x.ActionTime.Date == actionTime.Date && x.Action == EnumHelper<StaffStauts>.GetDisplayValue(StaffStauts.QuitWork));
                        if (checkExist == null)
                        {
                            var model = new WorkShiftCheckInOut
                            {
                                UserId = obj.UserId,
                                Action = obj.Action,
                                ActionTime = actionTime,
                                Note = obj.Note,
                                Picture = url,
                                Device = "Laptop/Destop",
                                LocationGPS = string.Format("[{0},{1}]", obj.Lat, obj.Lon),
                                LocationText = obj.LocationText,
                            };
                            _context.WorkShiftCheckInOuts.Add(model);
                            //msg.Title = String.Format(CommonUtil.ResourceValue("STL_MSG_ADD_SUCCES"));
                            msg.Title = _sharedResources["COM_ADD_SUCCESS"];
                            _context.SaveChanges();
                        }
                        else
                        {
                            msg.Error = true;
                            msg.Title = _stringLocalizer["STL_MSG_QUIT_IN_DATE"];
                        }
                    }

                }
                else
                {
                    msg.Error = true;
                    msg.Title = _sharedResources["COM_MSG_INFOMATION"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult Update(SStaffTimeKeepingModel obj, IFormFile picture)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                if (ModelState.IsValid)
                {
                    var url = "";
                    if (picture != null)
                    {
                        var upload = _upload.UploadImage(picture);
                        if (!upload.Error)
                        {
                            url = Path.Combine("/uploads/images/", upload.Object.ToString());
                        }
                    }
                    var data = _context.WorkShiftCheckInOuts.FirstOrDefault(x => x.Id == obj.Id);
                    var date = DateTime.Now;
                    if (obj.Action == EnumHelper<StaffStauts>.GetDisplayValue(StaffStauts.NoWork))
                    {
                        if (data != null)
                        {
                            var actionTime = DateTime.ParseExact(obj.ActionTime, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                            var actionTo = DateTime.ParseExact(obj.ActionTo, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                            var checkExist = _context.WorkShiftCheckInOuts.FirstOrDefault(x => x.UserId == obj.UserId && x.Id != obj.Id && x.Action == EnumHelper<StaffStauts>.GetDisplayValue(StaffStauts.NoWork) && (x.ActionTo >= actionTime && x.ActionTime <= actionTo));
                            if (checkExist == null)
                            {
                                data.UserId = obj.UserId;
                                data.Action = obj.Action;
                                data.ActionTime = !string.IsNullOrEmpty(obj.ActionTime) ? DateTime.ParseExact(obj.ActionTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : DateTime.Now;
                                data.ActionTo = !string.IsNullOrEmpty(obj.ActionTo) ? DateTime.ParseExact(obj.ActionTo, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                                data.Note = obj.Note;
                                if (!string.IsNullOrEmpty(url))
                                {
                                    data.Picture = url;
                                }
                                _context.WorkShiftCheckInOuts.Update(data);
                                _context.SaveChanges();
                                //msg.Title = String.Format(CommonUtil.ResourceValue("STL_MSG_UPDATE_SUCCES"));
                                msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];
                            }
                            else
                            {
                                msg.Error = true;
                                msg.Title = _stringLocalizer["STL_MSG_QUIT_IN_TIME"];
                            }
                        }
                    }
                    else if (obj.Action == EnumHelper<StaffStauts>.GetDisplayValue(StaffStauts.GoLate))
                    {
                        if (data != null)
                        {
                            var actionTime = DateTime.ParseExact(obj.ActionTime, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture);
                            var checkExist = _context.WorkShiftCheckInOuts.FirstOrDefault(x => x.UserId == obj.UserId && x.Id != obj.Id && x.ActionTime == actionTime && x.Action == EnumHelper<StaffStauts>.GetDisplayValue(StaffStauts.GoLate));
                            if (checkExist == null)
                            {
                                data.UserId = obj.UserId;
                                data.Action = obj.Action;
                                data.ActionTime = !string.IsNullOrEmpty(obj.ActionTime) ? DateTime.ParseExact(obj.ActionTime, "dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture) : DateTime.Now;
                                data.Note = obj.Note;
                                if (!string.IsNullOrEmpty(url))
                                {
                                    data.Picture = url;
                                }
                                _context.WorkShiftCheckInOuts.Update(data);
                                _context.SaveChanges();
                                //msg.Title = String.Format(CommonUtil.ResourceValue("STL_MSG_UPDATE_SUCCES"));
                                msg.Title =_sharedResources["COM_UPDATE_SUCCESS"];
                            }
                            else
                            {
                                msg.Error = true;
                                msg.Title = _stringLocalizer["STL_MSG_LATE_IN_TIME"];
                            }
                        }
                    }
                    else if (obj.Action == EnumHelper<StaffStauts>.GetDisplayValue(StaffStauts.QuitWork))
                    {
                        if (data != null)
                        {
                            var actionTime = DateTime.ParseExact(obj.ActionTime, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                            var checkExist = _context.WorkShiftCheckInOuts.FirstOrDefault(x => x.UserId == obj.UserId && x.Id != obj.Id && x.ActionTime.Date == actionTime.Date && x.Action == EnumHelper<StaffStauts>.GetDisplayValue(StaffStauts.QuitWork));
                            if (checkExist == null)
                            {
                                data.UserId = obj.UserId;
                                data.Action = obj.Action;
                                data.ActionTime = !string.IsNullOrEmpty(obj.ActionTime) ? DateTime.ParseExact(obj.ActionTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : DateTime.Now;
                                data.Note = obj.Note;
                                if (!string.IsNullOrEmpty(url))
                                {
                                    data.Picture = url;
                                }
                                _context.WorkShiftCheckInOuts.Update(data);
                                _context.SaveChanges();
                                //msg.Title = String.Format(CommonUtil.ResourceValue("STL_MSG_UPDATE_SUCCES"));
                                msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];
                            }
                            else
                            {
                                msg.Error = true;
                                msg.Title = _stringLocalizer["STL_MSG_QUIT_IN_DATE"];
                            }

                        }
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = CommonUtil.ResourceValue("COM_MSG_INFOMATION");
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult Delete([FromBody]int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.WorkShiftCheckInOuts.FirstOrDefault(x => x.Id == id);
                if (data != null)
                {
                    _context.WorkShiftCheckInOuts.Remove(data);
                }
                _context.SaveChanges();
                msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_DELETE_FAIL"];
            }
            return Json(msg);
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
        public class StatisticalTotal
        {
            public DateTime? Date { get; set; }
            //public int CountRegistration { get; set; }
            public int CountLate { get; set; }
            //public int CountReal { get; set; }
        }
    }
}