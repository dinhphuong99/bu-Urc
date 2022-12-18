using System;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.EntityFrameworkCore;
using FTU.Utils.HelperNet;
using System.Data;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Newtonsoft.Json;
using III.Domain.Enums;
using System.Globalization;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class MapOnlineController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IStringLocalizer<MapOnlineController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IHostingEnvironment _hostingEnvironment;
        public MapOnlineController(EIMDBContext context, IStringLocalizer<MapOnlineController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources, IHostingEnvironment hostingEnvironment)
        {
            _context = context;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
            _hostingEnvironment = hostingEnvironment;
        }
        public IActionResult Index()
        {
            return View();
        }
        [HttpPost]
        public object GetStaffKeeping([FromBody]SearchMap search)
        {
            var today = DateTime.Today;
            var fromDate = !string.IsNullOrEmpty(search.FromDate) ? DateTime.ParseExact(search.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(search.ToDate) ? DateTime.ParseExact(search.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            if(fromDate == null && toDate == null) {
                fromDate = today;
                toDate = today;
            }

            var data = (from a in _context.ShiftLogs
                        join b in _context.Users on a.CreatedBy equals b.UserName
                        where ((fromDate == null) || (a.ChkinTime.Value.Date >= fromDate.Value.Date))
                         && ((toDate == null) || ((a.ChkoutTime.HasValue ? a.ChkoutTime.Value.Date : today.Date) <= toDate.Value.Date))
                         && (string.IsNullOrEmpty(search.UserName) || a.CreatedBy.Equals(search.UserName))
                        select new
                        {
                            a.Id,
                            EmployCode = b.EmployeeCode != null ? b.EmployeeCode : "Chưa có mã",
                            b.GivenName,
                            LocationGPS = a.ChkinLocationGps,
                            b.Gender,
                            b.PhoneNumber,
                            b.Email,
                            TimeIn = a.ChkinTime.Value.ToString("HH:mm:ss dd/MM/yyyy"),
                            TimeOut = a.ChkoutTime.HasValue? a.ChkoutTime.Value.ToString("HH:mm:ss dd/MM/yyyy") : "",
                            a.ShiftCode,
                            ListRoleGroup = (from d in _context.Roles
                                             join e in _context.AdUserInGroups on d.Id equals e.RoleId into e1
                                             from e2 in e1.DefaultIfEmpty()
                                             where e2.IsDeleted == false && e2.UserId.Equals(b.Id)
                                             select new
                                             {
                                                 RoleCode = d.Code,
                                                 RoleName = d.Title
                                             }).DistinctBy(k => k.RoleCode),
                            a.CreatedBy
                        }).GroupBy(x => x.CreatedBy);
            var query = data.Select(x => x.LastOrDefault());
            var countUser = _context.Users.Where(x => x.Active);

            return new
            {
                ListIn = query,
                UserActive = countUser.Count()
            };
        }

        [HttpPost]
        public JsonResult GetRouteInOut([FromBody]SearchMap search)
        {
            var today = DateTime.Now;
            var fromDate = !string.IsNullOrEmpty(search.FromDate) ? DateTime.ParseExact(search.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(search.ToDate) ? DateTime.ParseExact(search.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

            List<ResumRouteInOut> resum = new List<ResumRouteInOut>();
            var data = from a in _context.ShiftLogs
                       where ((fromDate == null) || (a.ChkinTime.Value.Date >= fromDate.Value.Date))
                         && ((toDate == null) || ((a.ChkoutTime.HasValue ? a.ChkoutTime.Value.Date : today.Date) <= toDate.Value.Date))
                       && (string.IsNullOrEmpty(search.UserName) || a.CreatedBy.Equals(search.UserName))
                       group a by a.CreatedBy into g
                       select g;
            foreach (var item in data)
            {
                var shifts = item.ToList();
                List<RouteInOut> routes = new List<RouteInOut>();
                foreach (var shif in shifts)
                {
                    if (shif.ChkinTime.HasValue)
                    {
                        var routeInOut = new RouteInOut
                        {
                            Action = "In",
                            Address = shif.ChkinLocationTxt,
                            Time = shif.ChkinTime.Value.ToString("HH:mm:ss dd/MM/yyyy"),
                            LatLng = shif.ChkinLocationGps
                        };
                        routes.Add(routeInOut);
                    }
                    if (shif.ChkoutTime.HasValue)
                    {
                        var routeInOut = new RouteInOut
                        {
                            Action = "Out",
                            Address = shif.ChkoutLocationTxt,
                            Time = shif.ChkoutTime.Value.ToString("HH:mm:ss dd/MM/yyyy"),
                            LatLng = shif.ChkoutLocationGps
                        };
                        routes.Add(routeInOut);
                    }
                }
                var resumRoute = new ResumRouteInOut
                {
                    UserName = item.Key,
                    RouteInOuts = routes
                };
                resum.Add(resumRoute);
            }
            return Json(resum);
        }
        public class RouteInOut
        {
            public string Action { get; set; }
            public string Address { get; set; }
            public string Time { get; set; }
            public string LatLng { get; set; }
        }
        public class ResumRouteInOut
        {
            public string UserName { get; set; }
            public List<RouteInOut> RouteInOuts { get; set; }
        }
        public class SearchMap
        {
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string UserName { get; set; }
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