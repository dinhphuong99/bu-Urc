using System;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.EntityFrameworkCore;
using FTU.Utils.HelperNet;
using System.Data;
using System.Collections.Generic;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class UrencoWarningController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IStringLocalizer<UrencoWarningController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        public UrencoWarningController(EIMDBContext context, IStringLocalizer<UrencoWarningController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
        }
        public IActionResult Index()
        {
            return View();
        }
        [HttpPost]
        public object JTable([FromBody]JTableSearch jTablePara)
        {
            //int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.UrencoRoutes
                            .Where(x => x.IsDeleted == false && (string.IsNullOrEmpty(jTablePara.RouteName) || x.RouteName.ToLower().Contains(jTablePara.RouteName.ToLower())))
                        join b in _context.Users on a.CreatedBy equals b.UserName
                        join c in _context.CommonSettings.Where(x => x.Group == "ROAD_STATUS") on a.Status equals c.CodeSet into c2
                        from c in c2.DefaultIfEmpty()
                        join d in _context.CommonSettings.Where(x => x.Group == "ROAD_PRIORIRY") on a.Status equals d.CodeSet into d2
                        from d in d2.DefaultIfEmpty()
                        join e in _context.CommonSettings.Where(x => x.Group == "ROAD_LEVEL") on a.Status equals e.CodeSet into e2
                        from e in e2.DefaultIfEmpty()
                        join f in _context.HREmployees on a.Manager equals f.Id into f2
                        from f in f2.DefaultIfEmpty()
                        where
                        (jTablePara.Manager == null || (jTablePara.Manager.HasValue && a.Manager == jTablePara.Manager.Value))
                        && (string.IsNullOrEmpty(jTablePara.Status) || a.Status == jTablePara.Status)
                        && (jTablePara.NumLine == null || (jTablePara.NumLine.HasValue && a.NumLine == jTablePara.NumLine.Value))
                        select new
                        {
                            a.Id,
                            a.RouteName,
                            RouteLevel = a.RouteLevel,
                            RoutePriority = a.RoutePriority,
                            Manager = (f != null ? f.fullname : ""),
                            Status = (c != null ? c.ValueSet : ""),
                            a.NumLine,
                            a.NumLength,
                            CreatedBy = b != null ? b.GivenName : ""
                        };
            var count = query.Count();
            var data = query.AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "RouteName", "RouteLevel", "RoutePriority", "Manager", "Status", "NumLine", "NumLength", "CreatedBy");
            return Json(jdata);
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