
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("REQUEST_IMP_PRODUCT_HEADER")]
    public class RequestImpProductHeader
    {
        public RequestImpProductHeader()
        {
            ListProductDetail = new List<RequestImpProductDetail>();
        }

        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public string ReqCode { get; set; }
        [NotMapped]
        public string PoSupCode { get; set; }
        public string Title { get; set; }
        public string PoCode { get; set; }
        [NotMapped]
        public string PoName { get; set; }
        public string CusCode { get; set; }
        public string Status { get; set; }
        public DateTime CreatedTime { get; set; }
        public string CreatedBy { get; set; }
        public string UpdatedBy { get; set; }
        public DateTime? UpdatedTime { get; set; }
        public string ApprovedBy { get; set; }
        public DateTime? ApprovedTime { get; set; }
        public string DeletedBy { get; set; }
        public DateTime? DeletedTime { get; set; }
        public bool IsDeleted { get; set; }
        [NotMapped]
        public List<RequestImpProductDetail> ListProductDetail { get; set; }
        [NotMapped]
        public List<RequestImpProductDetail> ListDelProduct { get; set; }
        public string ProjectCode { get; set; }
        [NotMapped]
        public string ProjectName { get; set; }
    }
}
