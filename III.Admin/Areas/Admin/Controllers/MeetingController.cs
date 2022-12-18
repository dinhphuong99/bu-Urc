using System;
using System.Collections.Generic;
using System.Data;
using System.Globalization;
using System.IO;
using System.Linq;
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
using OpenXmlPowerTools;
using Syncfusion.EJ2.DocumentEditor;
using Syncfusion.EJ2.Spreadsheet;
using Syncfusion.XlsIO;
using System.Net.Http;
using System.Text;
using Microsoft.AspNetCore.Http.Internal;
using ESEIM;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class MeetingController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IStringLocalizer<ExcelController> _stringLocalizer;
        public static string _meetingID = new string("");
        public MeetingController(EIMDBContext context, IUploadService upload, IHostingEnvironment hostingEnvironment, IStringLocalizer<ExcelController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _hostingEnvironment = hostingEnvironment;
            _context = context;
            _upload = upload;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
        }

        public IActionResult Index()
        {
            var model = new RoomInfo();

            if (!string.IsNullOrEmpty(_meetingID))
            {
                var session = HttpContext.GetSessionUser();
                model = (from a in _context.ZoomManages.Where(x => !x.IsDeleted && x.ZoomId.Equals(_meetingID))
                         join b in _context.Users.Where(x => x.Active) on a.CreatedBy equals b.UserName
                         select new RoomInfo
                         {
                             RoomID = a.ZoomId,
                             RoomName = a.ZoomName,
                             RoomPassWord = a.ZoomPassword,
                             UserName = session.FullName,
                             CreatedBy = b.GivenName,
                             CreatedTime = a.CreatedTime.Value.ToString("HH:mm dd/MM/yyyy"),
                             Role = session.UserName.Equals(a.CreatedBy) ? 10 : 0
                         }).FirstOrDefault();
            }

            return View(model);
        }
        public IActionResult AddMeeting()
        {
            return View();
        }
        [HttpGet]
        public IActionResult EditMeeting(string meetingID)
        {
            ViewData["MeetingId"] = meetingID;
            return View();
        }
        public bool CheckPermissonJoinMeeting()
        {
            var check = false;

            return check;
        }
        [HttpPost]
        public bool CheckPermissonCreateMeeting()
        {
            var check = false;
            var session = HttpContext.GetSessionUser();
            check = _context.ApiGoogleServices.Any(x => x.Group.Equals(EnumHelper<GroupApi>.GetDisplayValue(GroupApi.Zoom)) && x.Description.Equals(session.Email) );
            return check;
        }

        [HttpPost]
        public object JoinMeeting(string meetingID)
        {
            _meetingID = "";
            var msg = new JMessage { };
            if (string.IsNullOrEmpty(meetingID))
            {
                msg.Error = true;
                msg.Title = "Thông tin cuộc họp trống";
                return msg;
            }
            else
            {
                var session = HttpContext.GetSessionUser();
                var check = _context.ZoomManages.FirstOrDefault(x => !string.IsNullOrEmpty(x.ListUserAccess) && !x.IsDeleted && x.ZoomId.Equals(meetingID));
                if (check != null)
                {
                    var listUserAccess = JsonConvert.DeserializeObject<List<UserJoinMeeting>>(check.ListUserAccess);
                    if (listUserAccess.Any(x => x.UserName.Equals(session.UserName) || x.UserName.Equals("ALL")) || check.CreatedBy.Equals(session.UserName))
                    {
                        _meetingID = meetingID;
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = "Bạn không được quyền tham gia cuộc họp cuộc họp";
                        return msg;
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Không lấy được thông tin cuộc họp";
                    return msg;
                }
                return msg;
            }
        }

        [HttpPost]
        public object CreateZoom([FromBody] ZoomRequest obj)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                msg = CommonUtil.Zoom(obj.Token, obj.Data);
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                msg.Object = ex;
                return Json(msg);
            }
        }

        [HttpPost]
        public object CreateMeeting([FromBody] ZoomModel obj)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var session = HttpContext.GetSessionUser();
                var check = _context.ApiGoogleServices.FirstOrDefault(x => x.Description.Equals(session.Email) && x.Group.Equals(EnumHelper<GroupApi>.GetDisplayValue(GroupApi.Zoom)));
                if (check == null)
                {
                    msg.Error = true;
                    msg.Title = "Tài khoản không được phép tạo meeting";
                    return Json(msg);
                }

                msg = CommonUtil.CreateMeeting(obj.Token, obj.Data, check.UserId);
                if (!msg.Error)
                {
                    if (check != null)
                    {
                        var zoomOld = _context.ZoomManages.Where(x => !x.IsDeleted && !string.IsNullOrEmpty(x.AccountZoom) && x.AccountZoom.Equals(check.Description));
                        foreach (var item in zoomOld)
                        {
                            item.IsDeleted = true;
                            _context.ZoomManages.Update(item);
                        }

                        var stringObj = JsonConvert.SerializeObject(msg.Object);
                        var rs = JsonConvert.DeserializeObject<ResponseZoom>(stringObj);
                        var zoom = new ZoomManage
                        {
                            ZoomId = rs.id.ToString(),
                            AccountZoom = check.Description,
                            ZoomName = rs.topic,
                            ZoomPassword = rs.password,
                            CreatedBy = User.Identity.Name,
                            CreatedTime = DateTime.Now,
                            Group = check.UserRole,
                            ListUserAccess = JsonConvert.SerializeObject(obj.ListUserMeeting)
                        };

                        _context.ZoomManages.Add(zoom);
                        _context.SaveChanges();

                        msg.Title = "Tạo meeting thành công";
                    }
                }

                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                msg.Object = ex;
                return Json(msg);
            }
        }

        [HttpPost]
        public object EditMeeting([FromBody] ZoomModel obj)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var session = HttpContext.GetSessionUser();
                var check = _context.ApiGoogleServices.FirstOrDefault(x => x.Description.Equals(session.Email) && x.Group.Equals(EnumHelper<GroupApi>.GetDisplayValue(GroupApi.Zoom)));
                if (check == null)
                {
                    msg.Error = true;
                    msg.Title = "Tài khoản không được phép sửa meeting";
                    return Json(msg);
                }

                var zoom = _context.ZoomManages.FirstOrDefault(x => !x.IsDeleted && x.ZoomId.Equals(obj.RoomID));
                if (zoom != null)
                {
                    zoom.ListUserAccess = JsonConvert.SerializeObject(obj.ListUserMeeting);
                    _context.ZoomManages.Update(zoom);
                    _context.SaveChanges();
                    msg.Title = "Sửa meeting thành công";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Không tìm thấy meeting";
                    return Json(msg);
                }

                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                msg.Object = ex;
                return Json(msg);
            }
        }

        [HttpPost]
        public List<ApiGoogleServices> GetListUserZoom()
        {
            var rs = new List<ApiGoogleServices>() { };
            try
            {
                rs = _context.ApiGoogleServices.Where(x => x.Group.Equals(EnumHelper<GroupApi>.GetDisplayValue(GroupApi.Zoom))).ToList();
            }
            catch (Exception ex)
            {
            }

            return rs;
        }

        [HttpPost]
        public JsonResult Insert([FromBody]ZoomManage obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                obj.CreatedTime = DateTime.Now;
                obj.CreatedBy = ESEIM.AppContext.UserName;
                _context.ZoomManages.Add(obj);
                _context.SaveChanges();
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_ADD_SUCCESS"));
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_ERR_ADD"));
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult Update([FromBody]ZoomManage obj)
        {
            var msgage = new JMessage { Error = false, Title = "" };
            try
            {
                //check exist code
                var checkExist = _context.ZoomManages.FirstOrDefault(x => x.Id == obj.Id);
                if (checkExist == null)
                {
                    msgage.Error = true;
                    msgage.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_EXITS"));
                }
                else
                {
                    obj.UpdatedBy = ESEIM.AppContext.UserName;
                    obj.UpdatedTime = DateTime.Now;
                    _context.ZoomManages.Update(obj);
                    _context.SaveChanges();
                    msgage.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_UPDATE_SUCCESS"));
                }
            }
            catch (Exception ex)
            {
                msgage.Error = true;
                msgage.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_UPDATE_FAILED"));
            }
            return Json(msgage);
        }

        [HttpPost]
        public JsonResult Delete([FromBody]ZoomRequest obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var url = string.Format("https://api.zoom.us/v2/rooms/{0}", obj.RoomID);
                msg = CommonUtil.DeleteZoom(url, obj.Token, obj.Data);

                //var zoomManage = _context.ZoomManages.FirstOrDefault(x => x.Id == id);
                //if (zoomManage != null)
                //{
                //    zoomManage.DeletedBy = ESEIM.AppContext.UserName;
                //    zoomManage.DeletedTime = DateTime.Now;
                //    zoomManage.IsDeleted = true;
                //    _context.ZoomManages.Update(zoomManage);
                //    _context.SaveChanges();
                //    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_DELETE_SUCCESS"));
                //}
                //else
                //{
                //    msg.Error = true;
                //    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_DELETE_FAIL"));
                //}
            }
            catch (Exception ex)
            {
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_DELETE_FAIL"));
                msg.Error = true;
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult GetListZoom()
        {
            JMessage msg = new JMessage { Error = false };
            try
            {
                var session = HttpContext.GetSessionUser();
                msg.Object = from a in _context.ZoomManages.Where(x => !x.IsDeleted)
                             join b in _context.Users.Where(x => x.Active) on a.CreatedBy equals b.UserName
                             select new RoomInfo
                             {
                                 RoomID = a.ZoomId,
                                 RoomName = a.ZoomName,
                                 RoomPassWord = a.ZoomPassword,
                                 UserName = session.FullName,
                                 CreatedBy = b.GivenName,
                                 CreatedTime = a.CreatedTime.Value.ToString("HH:mm dd/MM/yyyy"),
                                 Role = session.UserName.Equals(a.CreatedBy) ? 10 : 0,
                                 ListUserAccess = a.ListUserAccess,
                                 IsEdit = session.UserName.Equals(a.CreatedBy) ? true : false,
                             };
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi khi lấy dữ liệu!";
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetMeetingDetail(string meetingId)
        {
            JMessage msg = new JMessage { Error = false };
            try
            {
                var session = HttpContext.GetSessionUser();
                msg.Object = (from a in _context.ZoomManages.Where(x => !x.IsDeleted)
                              join b in _context.Users.Where(x => x.Active) on a.CreatedBy equals b.UserName
                              where a.ZoomId.Equals(meetingId)
                              select new RoomInfo
                              {
                                  RoomID = a.ZoomId,
                                  RoomName = a.ZoomName,
                                  RoomPassWord = a.ZoomPassword,
                                  UserName = session.FullName,
                                  CreatedBy = b.GivenName,
                                  CreatedTime = a.CreatedTime.Value.ToString("HH:mm dd/MM/yyyy"),
                                  Role = session.UserName.Equals(a.CreatedBy) ? 10 : 0,
                                  ListUserAccess = a.ListUserAccess,
                                  IsEdit = session.Email.Equals(a.AccountZoom) ? true : false,
                              }).FirstOrDefault();
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi khi lấy dữ liệu!";
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
        public class ZoomRequest
        {
            public ZoomRequest()
            {
                ApiGoogleServices = new List<ApiGoogleServices>();
            }

            public List<ApiGoogleServices> ApiGoogleServices { get; set; }
            public string MeetingTopic { get; set; }
            public string RoomID { get; set; }
            public string UserZoomID { get; set; }
            public string Token { get; set; }
            public string Data { get; set; }
        }
        public class ZoomModel
        {
            public ZoomModel()
            {
                ListUserMeeting = new List<UserJoinMeeting>();
            }

            public string MeetingTopic { get; set; }
            public string RoomID { get; set; }
            public string UserZoomID { get; set; }
            public string Token { get; set; }
            public string Data { get; set; }
            public List<UserJoinMeeting> ListUserMeeting { get; set; }
        }
        public class UserJoinMeeting
        {
            public string UserId { get; set; }
            public string UserName { get; set; }
            public string GivenName { get; set; }
        }
        public class RoomInfo
        {
            public string RoomID { get; set; }
            public string RoomName { get; set; }
            public string RoomPassWord { get; set; }
            public string UserName { get; set; }
            public string CreatedBy { get; set; }
            public string CreatedTime { get; set; }
            public int? Role { get; set; }
            public string ListUserAccess { get; set; }
            public bool IsEdit { get; set; }
        }
    }

}