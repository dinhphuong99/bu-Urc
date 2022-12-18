using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;

namespace ESEIM.Models
{
    [Table("EDMS_FILES")]
    public class EDMSFile
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int FileID { get; set; }

        [StringLength(100)]
        public string FileCode { get; set; }

        [StringLength(255)]
        public string FileName { get; set; }

        [StringLength(255)]
        public decimal? FileSize { get; set; }

        [StringLength(255)]
        public string FileTypePhysic { get; set; }

        [StringLength(255)]
        public string FileTypeWork { get; set; }

        public string Desc { get; set; }

        public string Tags { get; set; }

        [StringLength(255)]
        public string Url { get; set; }

        [StringLength(100)]
        public string ReposCode { get; set; }

        [StringLength(50)]
        public string NumberDocument { get; set; }

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

        [StringLength(255)]
        public string MimeType { get; set; }

        [StringLength(100)]
        public string CloudFileId { get; set; }

        public bool? IsEdit { get; set; }

        public bool? IsFileMaster { get; set; }

        public int? FileParentId { get; set; }
        [StringLength(50)]
        public string EditedFileBy { get; set; }

        public DateTime? EditedFileTime { get; set; }

        public string ListUserView { get; set; }
    }
}