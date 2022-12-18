﻿using System;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.EntityFrameworkCore;
using FTU.Utils.HelperNet;
using System.Data;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class CMSTagController : BaseController
    {
        public class TagsJtableModel
        {
            public int id { get; set; }
            public string name { get; set; }
            public bool? published { get; set; }

        }
        private readonly EIMDBContext _context;
        private readonly IStringLocalizer<CMSTagController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        public CMSTagController(EIMDBContext context, IStringLocalizer<CMSTagController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _sharedResources = sharedResources;
            _stringLocalizer = stringLocalizer;
        }
        public IActionResult Index()
        {
            return View();
        }

        public class JTableModelTag : JTableModel
        {
            
            public string name { get; set; }
            public bool? published { get; set; }
        }

        #region combobox

        [HttpPost]
        public object GetUser()
        {
            var query = _context.Users.Where(x => x.Active == true && x.UserType != 10).Select(x => new { x.Id, x.GivenName }).AsNoTracking().ToList();
            return query;
        }

        [HttpPost]
        public object GetCurrency()
        {
            var data = _context.FundCurrencys.Select(x => new { Code = x.CurrencyCode, Name = x.Note }).AsNoTracking().ToList();
            return data;
        }
        #endregion

        #region action

        [HttpPost]
        public object JTable([FromBody]JTableModelTag jTablePara)
        {
            int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var listCommon = _context.CommonSettings.Select(x => new { x.CodeSet, x.ValueSet });
            var query = (from a in _context.cms_tags
                         where ((string.IsNullOrEmpty(jTablePara.name) || (a.name.ToLower().Contains(jTablePara.name.ToLower()))))
                          && (jTablePara.published == null || a.published == jTablePara.published)
                         select new TagsJtableModel
                         {
                             id = a.id,
                             name = a.name,
                             published = a.published
                         }).ToList();
            int count = query.Count();
            var data = query.AsQueryable().OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBegin).Take(jTablePara.Length);
            var jdata = JTableHelper.JObjectTable(data.ToList(), jTablePara.Draw, count, "id","name", "published");
            return Json(jdata);
        }

        [HttpPost]
        public object GetItem([FromBody]int id)
        {
            var data = _context.cms_tags.FirstOrDefault(x => x.id.Equals(id));
            return Json(data);
        }
        [HttpPost]
        public JsonResult Insert([FromBody]cms_tags data)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var checkExist = _context.cms_tags.FirstOrDefault(x => x.name.ToLower() == data.name.ToLower() );
                if (checkExist != null)
                {
                    msg.Error = true;
                    //msg.Title = "Tags này đã tồn tại";
                    msg.Title = String.Format(_sharedResources["COM_MSG_EXITS"], _stringLocalizer["CMS_TAGS_CURD_LBL_TAG"]);

                }
                else
                {
                    var query = new cms_tags
                    {
                        name = data.name,
                        published = data.published
                    };
                    _context.cms_tags.Add(query);
                    _context.SaveChanges();
                   // msg.Title = "Thêm mới thành công";
                    msg.Title = _sharedResources["COM_ADD_SUCCESS"];

                }

            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public object Update([FromBody]cms_tags data)
        {
            var msg = new JMessage() { Error = false };
            {
                try
                {
                    var obj = _context.cms_tags.FirstOrDefault(x => x.id.Equals(data.id));
                    if (obj == null)
                    {
                        msg.Error = true;
                        //msg.Title = "Tags không tồn tại";
                        msg.Title = String.Format(_sharedResources["COM_MSG_NOT_EXITS"], _stringLocalizer["CMS_TAGS_CURD_LBL_TAG"]);

                    }
                    else
                    {
                        obj.name = data.name;
                        obj.published = data.published;
                        _context.cms_tags.Update(obj);
                        _context.SaveChanges();
                       // msg.Title = "Sửa tags thành công";
                        msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizer["CMS_TAGS_CURD_LBL_TAG"]);

                    }
                    return Json(msg);

                }
                catch (Exception ex)
                {
                    msg.Error = true;
                    // msg.Title = "Có lỗi xảy ra khi sửa tags";
                    msg.Title = _sharedResources["COM_MSG_ERR"];

                    return Json(msg);
                }

            }

        }

        [HttpPost]
        public object Delete(int id)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var obj = _context.cms_tags.FirstOrDefault(x => x.id.Equals(id));
                if (obj != null)
                {
                    _context.cms_tags.Remove(obj);
                    _context.SaveChanges();
                    //msg.Title = "Xóa Tags thành công";
                    msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizer["CMS_TAGS_CURD_LBL_TAG"]);

                }
                else
                {
                    msg.Error = true;
                   // msg.Title = "Tags không tồn tại";
                    
                    msg.Title = String.Format(_sharedResources["COM_MSG_NOT_EXITS"], _stringLocalizer["CMS_TAGS_CURD_LBL_TAG"]);

                }
                return Json(msg);

            }
            catch
            {
                msg.Error = true;
                //msg.Title = "Có lỗi khi xóa";
                msg.Title = _sharedResources["COM_MSG_ERR"];

                return Json(msg);
            }

        }
        //[HttpPost]
        //public object SetDefaultPayment(int id)
        //{
        //    var msg = new JMessage { Error = false };
        //    try
        //    {
        //        var data = _context.FundCurrencys.FirstOrDefault(x => x.Id == id);
        //        data.UpdatedBy = ESEIM.AppContext.UserName;
        //        data.UpdatedTime = DateTime.Now;
        //        data.DefaultPayment = true;

        //        var listFundCurrencys = _context.FundCurrencys.Where(x => x.DefaultPayment == true).ToList();
        //        listFundCurrencys.ForEach(x => x.DefaultPayment = false);
        //        foreach (var item in listFundCurrencys)
        //        {
        //            _context.FundCurrencys.Update(item);
        //        }
        //        _context.SaveChanges();
        //        msg.Title = String.Format(CommonUtil.ResourceValue("FCC_MSG_UPDATE_SUCCES"));//"Cập nhật thành công";
        //        return Json(msg);
        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Error = true;
        //        msg.Title = String.Format(CommonUtil.ResourceValue("FCC_MSG_UPDATE_ERROR")); //"Cập nhật thất bại";
        //        return Json(msg);
        //    }

        //}
        #endregion

        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
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