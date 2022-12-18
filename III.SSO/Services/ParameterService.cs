using Host.DbContexts;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace III.SSO.Services
{
    public interface IParameterService
    {
        int GetPagingLength();
        int GetSessionTimeoutAdmin();
    }

    public class ParameterService : IParameterService
    {
        private ApplicationDbContext _context;

        public ParameterService(ApplicationDbContext context)
        {
            _context = context;
        }

        public int GetPagingLength()
        {
            var para = _context.AdParameter.SingleOrDefault(x => x.ParameterCode == "ADMIN_NUM_PER_PAGE");
            int paging;
            if (para == null || !int.TryParse(para.Value, out paging) || paging <= 0) paging = 10;
            return paging;
        }

        public int GetSessionTimeoutAdmin()
        {
            var para = _context.AdParameter.SingleOrDefault(x => x.ParameterCode == "SYSTEM_SESSION_TIMEOUT");
            int timeout;
            if (para == null || !int.TryParse(para.Value, out timeout) || timeout <= 0) timeout = 15; // Minutes
            return timeout;
        }
    }
}
