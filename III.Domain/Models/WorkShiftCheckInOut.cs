using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("WORK_SHIFT_CHECKIN_OUT")]
    public class WorkShiftCheckInOut
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(255)]
        public string Action { get; set; }

        public DateTime ActionTime { get; set; }

        public DateTime? ActionTo { get; set; }

        public string Note { get; set; }

        [StringLength(255)]
        public string LocationGPS { get; set; }

        [StringLength(255)]
        public string LocationText { get; set; }

        [StringLength(50)]
        public string Device { get; set; }

        [StringLength(50)]
        public string UserId { get; set; }

        [StringLength(255)]
        public string Picture { get; set; }


        [StringLength(255)]
        public string Ip { get; set; }

        public int Session { get; set; }

        [StringLength(50)]
        public string CreatedBy { get; set; }

        public DateTime CreatedTime { get; set; }

        [StringLength(50)]
        public string UpdatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }
        public string DeletedBy { get; set; }
        public DateTime? DeletedTime { get; set; }

        public bool IsDeleted { get; set; }

        public string ShiftCode { get; set; }
    }

    public class SStaffTimeKeepingModel
    {
        public int? Id { get; set; }

        [Required]
        public string UserId { get; set; }

        [Required]
        public string Action { get; set; }

        [Required]
        public string ActionTime { get; set; }
        public string ActionTo { get; set; }

        [Required]
        public double Lat { get; set; }

        [Required]
        public double Lon { get; set; }
        public string LocationText { get; set; }
        public string Ip { get; set; }
        public string Note { get; set; }
    }

    public class SStaffTimeKeepingModelcheck
    {
        public int? Id { get; set; }

        //[Required]
        public string UserId { get; set; }

        //[Required]
        public string Action { get; set; }

        //[Required]
        public string ActionTime { get; set; }
        public string ActionTo { get; set; }

        //[Required]
        public double Lat { get; set; }

        //[Required]
        public double Lon { get; set; }
        public string LocationText { get; set; }
        public string Ip { get; set; }
        public string Note { get; set; }
        public string ShiftCode { get; set; }
    }

    public class UserModelCheckIn
    {
        [Required]
        public string UserId { get; set; }

        [Required]
        public double Lat { get; set; }

        [Required]
        public double Lon { get; set; }
        public string Note { get; set; }
        public string ShiftCode { get; set; }
    }
}
