using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using Newtonsoft.Json;

namespace ESEIM.Utils
{
    public class DeviceFcm
    {
        public string Token { get; set; }
        public string Device { get; set; }
    }
    public interface IFCMPushNotification
    {
        JMessage SendNotification(string _title, string _message, List<DeviceFcm> devices, Object dataObject);
    }
    public class FCMPushNotification : IFCMPushNotification
    {
        public JMessage SendNotification(string _title, string _message, List<DeviceFcm> devices, Object dataObject)
        {
            var msg = new JMessage { Error = false, Title = "" };
            var API_KEY = "AIzaSyCO5GO_EN_So9rxZgYFLSJ64jzy9GqC-dI";
            var senderId = "495931051565";
            HttpRequestMessage httpRequest = null;
            HttpClient httpClient = null;
            try
            {
                if (devices.Count > 0)
                {
                    foreach(var item in devices)
                    {
                        if(item.Device == "IOS")
                        {
                            var data = new
                            {
                                to = item.Token,
                                notification = new
                                {
                                    title = _title,
                                    body = _message,
                                },
                                data = new
                                {
                                    title = _title,
                                    body = _message,
                                    sound = "default",
                                    click_action = "OPEN_ACTIVITY_MAIN",
                                    BoardCode = dataObject != null ? dataObject.GetType().GetProperty("BoardCode").GetValue(dataObject, null) : "",
                                    BoardName = dataObject != null ? dataObject.GetType().GetProperty("BoardName").GetValue(dataObject, null) : "",
                                    ListCode = dataObject != null ? dataObject.GetType().GetProperty("ListCode").GetValue(dataObject, null) : "",
                                    CardCode = dataObject != null ? dataObject.GetType().GetProperty("CardCode").GetValue(dataObject, null) : "",
                                    CardName = dataObject != null ? dataObject.GetType().GetProperty("CardName").GetValue(dataObject, null) : "",
                                    BeginTime = dataObject != null ? dataObject.GetType().GetProperty("BeginTime").GetValue(dataObject, null) : "",
                                    EndTime = dataObject != null ? dataObject.GetType().GetProperty("EndTime").GetValue(dataObject, null) : "",
                                    CardLevel = dataObject != null ? dataObject.GetType().GetProperty("CardLevel").GetValue(dataObject, null) : "",
                                    projectCode = dataObject != null ? dataObject.GetType().GetProperty("ProjectCode").GetValue(dataObject, null) : "",
                                    projectName = dataObject != null ? dataObject.GetType().GetProperty("ProjectName").GetValue(dataObject, null) : "",
                                    typeCode = dataObject != null ? dataObject.GetType().GetProperty("Type").GetValue(dataObject, null) : "",
                                }
                            };
                            httpRequest = new HttpRequestMessage(HttpMethod.Post, "https://fcm.googleapis.com/fcm/send");
                            var json = JsonConvert.SerializeObject(data);
                            httpRequest.Headers.TryAddWithoutValidation("Authorization", "key=" + API_KEY);
                            httpRequest.Headers.TryAddWithoutValidation("Sender", $"id={senderId}");
                            httpRequest.Content = new StringContent(json, Encoding.UTF8, "application/json");
                            httpClient = new HttpClient();
                            httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
                            using (HttpResponseMessage response = httpClient.SendAsync(httpRequest).Result)
                            {
                                if (response.IsSuccessStatusCode)
                                {
                                    msg.Error = false;
                                    msg.Object = response.Content;
                                }
                                else
                                {
                                    msg.Error = true;
                                    msg.Object = response.Content;
                                }
                            }
                        }
                        else
                        {
                            var data = new
                            {
                                to = item.Token,
                               
                                data = new
                                {
                                    title = _title,
                                    body = _message,
                                    sound = "default",
                                    click_action = "OPEN_ACTIVITY_MAIN",
                                    BoardCode = dataObject != null ? dataObject.GetType().GetProperty("BoardCode").GetValue(dataObject, null) : "",
                                    BoardName = dataObject != null ? dataObject.GetType().GetProperty("BoardName").GetValue(dataObject, null) : "",
                                    ListCode = dataObject != null ? dataObject.GetType().GetProperty("ListCode").GetValue(dataObject, null) : "",
                                    CardCode = dataObject != null ? dataObject.GetType().GetProperty("CardCode").GetValue(dataObject, null) : "",
                                    CardName = dataObject != null ? dataObject.GetType().GetProperty("CardName").GetValue(dataObject, null) : "",
                                    BeginTime = dataObject != null ? dataObject.GetType().GetProperty("BeginTime").GetValue(dataObject, null) : "",
                                    EndTime = dataObject != null ? dataObject.GetType().GetProperty("EndTime").GetValue(dataObject, null) : "",
                                    CardLevel = dataObject != null ? dataObject.GetType().GetProperty("CardLevel").GetValue(dataObject, null) : "",
                                    projectCode = dataObject != null ? dataObject.GetType().GetProperty("ProjectCode").GetValue(dataObject, null) : "",
                                    projectName = dataObject != null ? dataObject.GetType().GetProperty("ProjectName").GetValue(dataObject, null) : "",
                                    typeCode = dataObject != null ? dataObject.GetType().GetProperty("Type").GetValue(dataObject, null) : "",
                                }
                            };
                            httpRequest = new HttpRequestMessage(HttpMethod.Post, "https://fcm.googleapis.com/fcm/send");
                            var json = JsonConvert.SerializeObject(data);
                            httpRequest.Headers.TryAddWithoutValidation("Authorization", "key=" + API_KEY);
                            httpRequest.Headers.TryAddWithoutValidation("Sender", $"id={senderId}");
                            httpRequest.Content = new StringContent(json, Encoding.UTF8, "application/json");
                            httpClient = new HttpClient();
                            httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
                            using (HttpResponseMessage response = httpClient.SendAsync(httpRequest).Result)
                            {
                                if (response.IsSuccessStatusCode)
                                {
                                    msg.Error = false;
                                    msg.Object = response.Content;
                                }
                                else
                                {
                                    msg.Error = true;
                                    msg.Object = response.Content;
                                }
                            }
                        }
                    }
                }
              
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;

            }
            finally
            {
                httpRequest.Dispose();
                httpClient.Dispose();
            }
            return msg;
        }
    }
}
