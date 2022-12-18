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
    public class UrencoSettingController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IStringLocalizer<UrencoSettingController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IStringLocalizer<MaterialProductController> _materialProductLocalizer;
        private readonly IStringLocalizer<MaterialProductGroupController> _materialProductGroupLocalizer;
        private readonly IStringLocalizer<MaterialsTypeController> _materialProductTypeLocalizer;
        private readonly IStringLocalizer<ServiceCategoryController> _serviceCategoryLocalizer;
        private readonly IStringLocalizer<ServiceCategoryGroupController> _serviceCategoryGroupLocalizer;
        private readonly IStringLocalizer<ServiceCategoryTypeController> _serviceCategoryTypeLocalizer;
        private readonly IStringLocalizer<ServiceCategoryPriceController> _serviceCategoryPriceLocalizer;
        private readonly IStringLocalizer<UrencoCostGroupController> _urencoCostGroupLocalizer;
        private readonly IStringLocalizer<UrencoCostTypeController> _urencoCostTypeLocalizer;
        private readonly IStringLocalizer<UrencoCostCategoryController> _urencoCostCategoryLocalizer;

        public UrencoSettingController(EIMDBContext context, IStringLocalizer<UrencoSettingController> stringLocalizer
            , IStringLocalizer<SharedResources> sharedResources, IStringLocalizer<MaterialProductController> materialProductLocalizer
            , IStringLocalizer<MaterialProductGroupController> materialProductGroupLocalizer, IStringLocalizer<MaterialsTypeController> materialProductTypeLocalizer
            , IStringLocalizer<ServiceCategoryController> serviceCategoryLocalizer
            , IStringLocalizer<ServiceCategoryGroupController> serviceCategoryGroupLocalizer
            , IStringLocalizer<ServiceCategoryTypeController> serviceCategoryTypeLocalizer
            , IStringLocalizer<ServiceCategoryPriceController> serviceCategoryPriceLocalizer
            , IStringLocalizer<UrencoCostGroupController> urencoCostGroupLocalizer
            , IStringLocalizer<UrencoCostTypeController> urencoCostTypeLocalizer
            , IStringLocalizer<UrencoCostCategoryController> urencoCostCategoryLocalizer
            )
        {
            _context = context;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
            _materialProductLocalizer = materialProductLocalizer;
            _materialProductGroupLocalizer = materialProductGroupLocalizer;
            _materialProductTypeLocalizer = materialProductTypeLocalizer;
            _serviceCategoryLocalizer = serviceCategoryLocalizer;
            _serviceCategoryGroupLocalizer = serviceCategoryGroupLocalizer;
            _serviceCategoryTypeLocalizer = serviceCategoryTypeLocalizer;
            _serviceCategoryPriceLocalizer = serviceCategoryPriceLocalizer;
            _urencoCostGroupLocalizer = urencoCostGroupLocalizer;
            _urencoCostTypeLocalizer = urencoCostTypeLocalizer;
            _urencoCostCategoryLocalizer = urencoCostCategoryLocalizer;
        }
        public IActionResult Index()
        {
            return View();
        }
        [HttpPost]
        public object insert([FromBody]UrencoRoute jTablePara)
        {
            var msg = new JMessage() { Error = false };
            try
            {

            }
            catch (Exception ex)
            {

            }

            return Json(msg);
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
            //var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var data = query.AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "RouteName", "RouteLevel", "RoutePriority", "Manager", "Status", "NumLine", "NumLength", "CreatedBy");
            return Json(jdata);
        }
        [HttpPost]
        public object JTableWarning()
        {
            Dictionary<string, object> dictionary = new Dictionary<string, object>();
            dictionary.Add("draw", 1);
            dictionary.Add("recordsFiltered", 2);
            dictionary.Add("recordsTotal", 2);
            Dictionary<string, string> data = new Dictionary<string, string>();
            List<object> datas = new List<object>();
            data.Add("Id", "1");
            data.Add("STT", "1");
            data.Add("CarCode", "30U7017");
            data.Add("Title", "Đi vào Đường Bồ Đề");
            data.Add("Driver", "Nguyễn Văn Huy");
            data.Add("WarningType", "Chạy sai tuyến đường");
            data.Add("Time", "16:30 05/08/2019");
            data.Add("GPS", "21.0352164,105.8713384");
            data.Add("GPSText", "147, Đường Bồ Đề, Phường Bồ Đề, Quận Long Biên, Bồ Đề, Long Biên, Hà Nội, Vietnam");
            datas.Add(data);

            data = new Dictionary<string, string>();
            data.Add("Id", "2");
            data.Add("STT", "2");
            data.Add("CarCode", "89A10510");
            data.Add("Title", "Chạy quá 5km/h");
            data.Add("Driver", "Lê Đức Phòng");
            data.Add("WarningType", "Quá tốc độ");
            data.Add("Time", "21:30 04/08/2019");
            data.Add("GPS", "21.040092, 105.874965");
            data.Add("GPSText", "Cổ Linh, Bồ Đề, Long Biên, Hà Nội, Vietnam");
            datas.Add(data);


            dictionary.Add("data", datas);
            return Json(dictionary);
        }

        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_materialProductGroupLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_materialProductTypeLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_serviceCategoryLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_serviceCategoryGroupLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_serviceCategoryTypeLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_serviceCategoryPriceLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_urencoCostGroupLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_urencoCostTypeLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_urencoCostCategoryLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_materialProductLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }
        #endregion
    }

}