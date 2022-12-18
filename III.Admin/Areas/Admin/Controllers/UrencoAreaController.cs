using System;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class UrencoAreaController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IStringLocalizer<UrencoAreaController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        public UrencoAreaController(EIMDBContext context, IStringLocalizer<UrencoAreaController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
        }
        public IActionResult Index()
        {
            return View();
        }
        public class UrencoAreaJtableModel : JTableModel
        {
            public string AreaCode { get; set; }
            public string AreaName { get; set; }
        }
        [HttpPost]
        public object JTable([FromBody]UrencoAreaJtableModel jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.UrencoAreas
                        where a.IsDeleted == false &&
                        (string.IsNullOrEmpty(jTablePara.AreaCode) || a.AreaCode.ToLower().Contains(jTablePara.AreaCode)) &&
                        (string.IsNullOrEmpty(jTablePara.AreaName) || a.AreaName.ToLower().Contains(jTablePara.AreaName))
                        select a;
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).Select(x => new
            {
                x.Id,
                x.AreaCode,
                x.AreaName,
                x.GisData,
                x.Description,
                x.CreatedBy,
                x.CreatedTime,
            }).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "AreaCode", "AreaName", "GisData", "Description", "CreatedBy", "CreatedTime");
            return Json(jdata);
        }

        [HttpPost]
        public object GetListRoute()
        {
            return _context.UrencoRoutes.Where(x => !x.IsDeleted).Select(x => new
            {
                Code = x.RouteCode,
                Name = x.RouteName
            });
        }
        [HttpPost]
        public object GetListTeam()
        {
            return _context.Teams.Where(x => !x.IsDeleted).Select(x => new
            {
                Code = x.TeamCode,
                Name = x.TeamName
            });
        }

        [HttpGet]
        public object GetItem(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.UrencoAreas.FirstOrDefault(x => x.Id == id);
                if (data != null)
                {
                    var model = new UrencoAreaModel
                    {
                        AreaCode = data.AreaCode,
                        AreaName = data.AreaName,
                        Description = data.Description,
                        GisData = data.GisData,
                        Picture = data.Picture,
                        ListRoute = _context.UrencoAreaRoutes.Where(x => x.AreaCode == data.AreaCode).Select(y => new Properties
                        {
                            Id = y.Id,
                            Code = y.RouteCode,
                            Name = _context.UrencoRoutes.FirstOrDefault(z => z.RouteCode == y.RouteCode).RouteName ?? ""
                        }).AsNoTracking().ToList(),
                        ListTeam = _context.UrencoAreaTeams.Where(x => x.AreaCode == data.AreaCode).Select(y => y.TeamCode).AsNoTracking().ToList()
                    };
                    msg.Object = model;
                }
            }
            catch (Exception ex)
            {
                msg.Object = ex.Message;
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra. Xin thử lại !";
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult Insert([FromBody]UrencoAreaModel obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                //area
                var area = new UrencoArea
                {
                    AreaCode = obj.AreaCode,
                    AreaName = obj.AreaName,
                    GisData = obj.GisData,
                    Description = obj.Description,
                    Picture = obj.Picture,
                    CreatedBy = ESEIM.AppContext.UserName,
                    CreatedTime = DateTime.Now
                };
                _context.UrencoAreas.Add(area);

                //router
                foreach (var item in obj.ListRoute)
                {
                    var route = new UrencoAreaRoute
                    {
                        AreaCode = obj.AreaCode,
                        RouteCode = item.Code
                    };
                    _context.UrencoAreaRoutes.Add(route);
                }
                //team
                foreach (var item in obj.ListTeam)
                {
                    var team = new UrencoAreaTeam
                    {
                        AreaCode = obj.AreaCode,
                        TeamCode = item
                    };
                    _context.UrencoAreaTeams.Add(team);
                }
                _context.SaveChanges();
                msg.Title = "Thêm tuyến đường thành công";
            }
            catch (Exception ex)
            {
                msg.Object = ex.Message;
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra. Xin thử lại !";
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult Update([FromBody]UrencoAreaModel obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var area = _context.UrencoAreas.FirstOrDefault(x => x.AreaCode == obj.AreaCode);
                if (area != null)
                {
                    area.AreaName = obj.AreaName;
                    area.GisData = obj.GisData;
                    area.Description = obj.Description;
                    area.UpdatedBy = ESEIM.AppContext.UserName;
                    area.UpdatedTime = DateTime.Now;
                    area.Picture = obj.Picture;
                    _context.UrencoAreas.Update(area);

                    //route
                    if (obj.ListDeleteRoute.Any())
                    {
                        var listRouteDeleted = _context.UrencoAreaRoutes.Where(x => obj.ListDeleteRoute.Any(y => y == x.Id));
                        if (listRouteDeleted.Any())
                        {
                            _context.UrencoAreaRoutes.RemoveRange(listRouteDeleted);
                        }
                    }
                    foreach (var item in obj.ListRoute.Where(x => x.Id < 0))
                    {
                        var route = new UrencoAreaRoute
                        {
                            AreaCode = obj.AreaCode,
                            RouteCode = item.Code
                        };
                        _context.UrencoAreaRoutes.Add(route);
                    }
                    //team
                    var listTeamOld = _context.UrencoAreaTeams.Where(x => x.AreaCode == obj.AreaCode);
                    if (listTeamOld.Any())
                    {
                        _context.UrencoAreaTeams.RemoveRange(listTeamOld);
                    }

                    foreach (var item in obj.ListTeam)
                    {
                        var team = new UrencoAreaTeam
                        {
                            AreaCode = obj.AreaCode,
                            TeamCode = item
                        };
                        _context.UrencoAreaTeams.Add(team);
                    }
                    _context.SaveChanges();
                    msg.Title = "Cập nhập vùng thành công !";
                }
            }
            catch (Exception ex)
            {
                msg.Object = ex.Message;
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra. Xin thử lại !";
            }
            return Json(msg);
        }

        [HttpPost]
        public object Delete(int id)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var obj = _context.UrencoAreas.FirstOrDefault(x => x.Id == id);
                if (obj != null)
                {
                    _context.UrencoAreas.Remove(obj);
                    _context.SaveChanges();
                    msg.Title = "Xóa thành công !";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = "Có lỗi khi xóa khoản mục !";
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
    }
    public class UrencoAreaModel
    {
        public UrencoAreaModel()
        {
            ListDeleteRoute = new List<int>();
        }
        public string AreaCode { get; set; }
        public string AreaName { get; set; }
        public string GisData { get; set; }
        public string Description { get; set; }
        public string Picture { get; set; }
        public List<Properties> ListRoute { get; set; }
        public List<int> ListDeleteRoute { get; set; }
        public List<string> ListTeam { get; set; }
    }
}