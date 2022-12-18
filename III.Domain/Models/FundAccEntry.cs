using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("FUND_ACC_ENTRY")]
    public class FundAccEntry
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(100)]
        public string AetCode { get; set; }

        [StringLength(255)]
        public string Title { get; set; }

        [StringLength(255)]
        public string AetType { get; set; }

        [StringLength(255)]
        public string AetDescription { get; set; }

        public bool? IsPlan { get; set; }
        public bool? IsCompleted { get; set; }
        [StringLength(100)]
        public string CatCode { get; set; }

        public DateTime? DeadLine { get; set; }

        [StringLength(255)]
        public string AetRelative { get; set; }

        [StringLength(255)]
        public string AetRelativeType { get; set; }

        [StringLength(255)]
        public string Payer { get; set; }

        [StringLength(255)]
        public string Receiptter { get; set; }

        public decimal Total { get; set; }

        [StringLength(100)]
        public string Currency { get; set; }

        [StringLength(50)]
        public string CreatedBy { get; set; }

        public DateTime? CreatedTime { get; set; }

        [StringLength(50)]
        public string UpdatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }

        [StringLength(50)]
        public string DeletedBy { get; set; }

        public DateTime? DeletedTime { get; set; }

        public bool IsDeleted { get; set; }

        [StringLength(500)]
        public string GoogleMap { get; set; }

        [StringLength(255)]
        public string Address { get; set; }

        [StringLength(255)]
        public string Status { get; set; }

        public string LogData { get; set; }

        [StringLength(100)]
        public string ObjCode { get; set; }

        [StringLength(50)]
        public string ObjType { get; set; }
    }
    public class FundAccEntryModel
    {
        public FundAccEntryModel()
        {
            ListFileAccEntry = new List<FundFile>();
            ListFileAccEntryRemove = new List<FundFile>();
        }
        public int Id { get; set; }

        [StringLength(100)]
        public string AetCode { get; set; }

        [StringLength(255)]
        public string Title { get; set; }

        [StringLength(255)]
        public string AetType { get; set; }

        [StringLength(255)]
        public string AetDescription { get; set; }

        public bool? IsPlan { get; set; }
        public bool? IsCompleted { get; set; }
        [StringLength(100)]
        public string CatCode { get; set; }

        public string DeadLine { get; set; }

        [StringLength(255)]
        public string AetRelative { get; set; }

        [StringLength(255)]
        public string AetRelativeType { get; set; }

        [StringLength(255)]
        public string Payer { get; set; }

        [StringLength(255)]
        public string Receiptter { get; set; }

        public decimal Total { get; set; }

        [StringLength(100)]
        public string Currency { get; set; }

        [StringLength(500)]
        public string GoogleMap { get; set; }

        [StringLength(255)]
        public string Address { get; set; }

        [StringLength(255)]
        public string Status { get; set; }

        public string LogData { get; set; }

        [StringLength(255)]
        public string Note { get; set; }
        [StringLength(255)]
        public string CreateBy { get; set; }

        public List<FundFile> ListFileAccEntry { get; set; }

        public List<FundFile> ListFileAccEntryRemove { get; set; }

        public string ObjCode { get; set; }

        public string ObjType { get; set; }
    }

    public class FundAccEntryResultModel
    {
        public FundAccEntryResultModel()
        {
            ListFundAccEntry = new List<FundAccEntry>();
        }
        public List<FundAccEntry> ListFundAccEntry { get; set; }
     
        public decimal TotalReceipt { get; set; }
        public decimal TotalExpense { get; set; }
        public decimal TotalSurplus { get; set; }
    }

    public class FundFile
    {
        public int? Id { get; set; }
        public string FileName { get; set; }
        public string FilePath { get; set; }
        public string FileType { get; set; }
        public string ContentType { get; set; }
    }
}
