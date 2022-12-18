using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("EDMS_REPO_CAT_FILE")]
    public class EDMSRepoCatFile
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(100)]
        public string FileCode { get; set; }

        [StringLength(100)]
        public string ReposCode { get; set; }

        [StringLength(100)]
        public string CatCode { get; set; }

        [StringLength(100)]
        public string ObjectCode { get; set; }

        [StringLength(100)]
        public string ObjectType { get; set; }

        [StringLength(255)]
        public string Path { get; set; }

        [StringLength(255)]
        public string FolderId { get; set; }
    }

    public class EDMSRepoCatFileModel
    {
        public string FileCode { get; set; }
        public string NumberDocument { get; set; }
        public string Tags { get; set; }
        public string Desc { get; set; }
        public string ContractCode { get; set; }
        public string ProjectCode { get; set; }
        public string CustomerCode { get; set; }
        public string AssetCode { get; set; }
        public string SupplierCode { get; set; }
        public string ProductCode { get; set; }
        public string EmployeeCode { get; set; }
        public string RequestCode { get; set; }
        public string PoCode { get; set; }
        public string WHS_Code { get; set; }
        public int? CateRepoSettingId { get; set; }
        public string CateRepoSettingCode { get; set; }
        public string Path { get; set; }
        public string FolderId { get; set; }
        public bool IsMore { get; set; }
    }
}
