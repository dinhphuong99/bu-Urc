using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.EntityFrameworkCore;
using FTU.Utils.HelperNet;
using Microsoft.Extensions.Options;
using ESEIM;
using Newtonsoft.Json.Linq;
using Microsoft.Extensions.Localization;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class UrencoMaterialProductGroupController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly AppSettings _appSettings;
        private readonly IStringLocalizer<UrencoMaterialProductGroupController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        public class JTableModelCustom : JTableModel
        {
            public string code { get; set; }
            public string name { get; set; }
            public string parenid { get; set; }
            public string key1 { get; set; }
        }
        public UrencoMaterialProductGroupController(EIMDBContext context, IOptions<AppSettings> appSettings, IStringLocalizer<UrencoMaterialProductGroupController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _appSettings = appSettings.Value;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
        }
        public IActionResult Index()
        {
            return View("Index");
        }
        [HttpPost]
        public object JTable([FromBody]JTableModelCustom jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.UrencoMaterialProductGroup.Where(x=>x.IsDeleted==false)
                            //join b in _context.cms_extra_fields_groups on a.Group equals b.Id
                            //orderby b.Name
                            join  b in _context.UrencoMaterialProductGroup.Where(x => x.IsDeleted == false) on a.ParentID equals b.Id into b2
                            from b in b2.DefaultIfEmpty()
                        where (jTablePara.code == null || jTablePara.code == "" || a.Code.ToLower().Contains(jTablePara.code.ToLower()))
                        && (jTablePara.name == null || jTablePara.name == "" || a.Name.ToString().ToLower().Contains(jTablePara.name.ToLower()))
                        && (string.IsNullOrEmpty(jTablePara.parenid) || (a.ParentID!=null&&a.ParentID== Int32.Parse(jTablePara.parenid)))
                        select new
                        {
                            Id = a.Id,
                            Code = a.Code,
                            Name = a.Name,
                            ParenID = a.ParentID,
                            Description = a.Description,
                            ParentName = (b!=null?b.Name:"")
                        };
            var count = query.Count();

            var data = query
                .OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "Code", "Name", "ParenID", "Description");

            return Json(jdata);
        }
        [HttpPost]
        public JsonResult Insert([FromBody]UrencoMaterialProductGroup obj)
        {
            var msg = new JMessage { Title = "", Error = false };
            try
            {
                var exist = _context.UrencoMaterialProductGroup.FirstOrDefault(x => x.Code == obj.Code);
                if (exist != null)
                {
                    msg.Error = true;
                    msg.Title = String.Format(CommonUtil.ResourceValue("MPG_MSG_MPG_CODE_ALREADY_EXIST"));//"Mã nhóm vật tư đã tồn tại";
                }
                else
                {
                    obj.CreatedBy = ESEIM.AppContext.UserName;
                    obj.CreatedTime = DateTime.Now;
                    _context.UrencoMaterialProductGroup.Add(obj);
                    _context.SaveChanges();
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_ADD_SUCCESS"), CommonUtil.ResourceValue("MGP_LBL_MGP"));//"Thêm nhóm vật tư thành công";
                }
            }
            catch
            {
                msg.Error = true;
                msg.Title = String.Format( CommonUtil.ResourceValue("MGP_MSG_ADD_ERROR")); //"Thêm nhóm vật tư lỗi";
            }
            return Json(msg);
        }
        [HttpPost]
        public object Update([FromBody]UrencoMaterialProductGroup obj)
        {
            var msg = new JMessage();
            try
            {
                obj.UpdatedTime = DateTime.Now.Date;
                _context.UrencoMaterialProductGroup.Update(obj);
                _context.SaveChanges();

                msg.Error = false;
                msg.Title = String.Format(CommonUtil.ResourceValue("MGP_MSG_SAVE_SUCCESS")); //"Đã lưu thay đổi";

                return msg;
            }
            catch
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("MGP_MSG_ERROR")); //"Có lỗi xảy ra!";
                return msg;
            }
        }
        [HttpPost]
        public object Delete(int id)
        {
            var msg = new JMessage { Error = true };
            try
            {
                var data = _context.UrencoMaterialProductGroup.FirstOrDefault(x => x.Id == id);
                _context.UrencoMaterialProductGroup.Remove(data);
                _context.SaveChanges();
                msg.Error = false;
                msg.Title = String.Format(CommonUtil.ResourceValue("MGP_MSG_DELETE_SUCCESS")); //"Xóa thành công!";
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("MGP_MSG_DELETE_ERROR")); //"Có lỗi khi xóa!";
                return Json(msg);
            }
        }
        public object GetItem(int id)
        {

            //if (id == null || id < 0)
            //{
            //    return Json("");
            //}
            var a = _context.UrencoMaterialProductGroup.AsNoTracking().Single(m => m.Id == id);
            return Json(a);
        }
        [HttpPost]
        public object gettreedataCategory()
        {
            var msg = new JMessage { Error = true };

            try
            {
                var data = _context.MaterialProducts.OrderBy(x => x.Id);
                msg.Object = data;
                msg.Error = false;
            }
            catch (Exception ex)
            {
                msg.Title = "Get Parent Group fail ";
            }

            return Json(msg);
        }
        [HttpPost]
        public object gettreedataCoursetype()
        {
            var msg = new JMessage { Error = true };

            try
            {
                var data = _context.UrencoMaterialProductGroup.GroupBy(x => x.Name).Select(x => x.First()).Where(d => d.ParentID == null);
                var dataa = data.Distinct();
                msg.Object = dataa;

                msg.Error = false;
            }
            catch (Exception ex)
            {
                msg.Title = "Get Parent Group fail ";
            }

            return Json(msg);
        }
        [HttpPost]
        public object gettreedataLevel()
        {
            var msg = new JMessage { Error = true };

            try
            {
                var data = _context.UrencoMaterialProductGroup.GroupBy(x => x.Name).Select(x => x.First()).Where(d => d.ParentID == null).ToList();
                var dataa = data.Distinct();
                msg.Object = dataa;

                msg.Error = false;
            }
            catch (Exception ex)
            {
                msg.Title = "Get Parent Group fail ";
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
}
