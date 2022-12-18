using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using ESEIM.Models;
using Newtonsoft.Json;

namespace ESEIM.Utils
{
    public static class UrencoBinhAnhData
    {
        private static readonly HttpClient Client = new HttpClient();
        public static async Task<String> GetUrencoBinhAnhData()
        {
            string data = "";
            var msg = new JMessage();
            try
            {
                const string key = "XyqphW32F93ezSYXvqbyH95fMPn8f3W7kWXbC6DLY";
                string xnCode = "7091";

                var url = new Uri($" http://gps4.binhanh.com.vn/WebServices/BinhAnh.asmx/GetVehicleInfoWithAddress?xncode={xnCode}&key={key}");

                var response = await Client.GetAsync(url);

              
                using (var content = response.Content)
                {
                    data = await content.ReadAsStringAsync();
                }
            }catch(Exception ex)
            {
                msg.Title = "Lỗi";
            }
            return data;
        }
    }
}
