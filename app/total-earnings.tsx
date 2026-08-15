// import { Ionicons } from "@expo/vector-icons";
// import dayjs from "dayjs";
// import { Image } from "expo-image";
// import { useRouter } from "expo-router";
// import React, { useEffect, useState } from "react";

// import {
//   ScrollView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { supabase } from "../lib/supabase";

// import * as Print from "expo-print";
// import * as Sharing from "expo-sharing";
// type Booking = {
//   id?: string;
//   Customer_Name: string;
//   AMOUNT: number;
//   earned_at: string;
// };

// export default function TotalEarnings() {
//   const router = useRouter();

//   const [data, setData] = useState<Booking[]>([]);
//   const [total, setTotal] = useState(0);

//   const [loading, setLoading] = useState(true);

//   const fetchTotalData = async () => {
//     setLoading(true); // ✅ start loading

//     const { data: userData } = await supabase.auth.getUser();
//     const email = userData?.user?.email;

//     if (!email) return;

//     const { data: bookings } = await supabase
//       .from("staff_earnings")
//       .select(
//         `
//     id,
//     Customer_Name,
//     AMOUNT,
//     earned_at
//   `,
//       )
//       .eq("staff_email", email)
//       .eq("payment_status", "paid")
//       .order("earned_at", { ascending: false });

//     setData(bookings || []);

//     const sum = (bookings || []).reduce(
//       (acc: number, item: any) => acc + Number(item.AMOUNT || 0),
//       0,
//     );

//     setTotal(sum);

//     setLoading(false); // ✅ stop loading
//   };

//   useEffect(() => {
//     fetchTotalData();
//   }, []);

//   const generatePDF = async () => {
//     try {
//       const rows = data
//         .map(
//           (item) => `
//         <tr>
// <td>${item.Customer_Name}</td>
// <td>₹${item.AMOUNT}</td>
// <td>${dayjs(item.earned_at).format("DD MMM YYYY")}</td>
//         </tr>
//       `,
//         )
//         .join("");

//       const html = `
//       <html>
//         <body style="font-family: Arial; padding: 20px;">
//           <h1 style="text-align:center;">
//             Earnings Report
//           </h1>

//           <h2>Total Earnings: ₹${total}</h2>

//           <table
//             width="100%"
//             border="1"
//             cellspacing="0"
//             cellpadding="8"
//             style="border-collapse: collapse; margin-top: 20px;"
//           >
//             <thead>
//               <tr style="background-color:#f2f2f2;">
//                 <th>Customer</th>
//                 <th>Amount</th>
//                 <th>Date</th>
//               </tr>
//             </thead>

//             <tbody>
//               ${rows}
//             </tbody>
//           </table>
//         </body>
//       </html>
//     `;

//       // Generate PDF
//       const { uri } = await Print.printToFileAsync({
//         html,
//       });

//       await Sharing.shareAsync(uri, {
//         mimeType: "application/pdf",
//         dialogTitle: "Earnings Report",
//       });

//       // Open PDF directly
//     } catch (error) {
//       console.log("PDF ERROR:", error);
//     }
//   };

//   return (
//     <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
//       {/* HEADER */}
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => router.replace("/my-role")}>
//           <Image
//             source={require("../assets/images/logo.png")}
//             style={styles.logo}
//             contentFit="contain"
//           />
//         </TouchableOpacity>

//         <TouchableOpacity
//           onPress={() =>
//             router.canGoBack() ? router.back() : router.replace("/dashboard")
//           }
//         >
//           <Ionicons name="arrow-back" size={24} color="#000" />
//         </TouchableOpacity>
//       </View>

//       <ScrollView
//         style={{ flex: 1 }}
//         contentContainerStyle={{
//           padding: 16,
//           paddingBottom: 120,
//         }}
//         showsVerticalScrollIndicator={false}
//       >
//         {/* TOTAL */}
//         <Text style={styles.totalText}>Total: ₹{total}</Text>

//         {/* LIST */}
//         {loading ? (
//           <Text style={{ textAlign: "center", marginTop: 40 }}>Loading...</Text>
//         ) : data.length === 0 ? (
//           <Text style={{ textAlign: "center", marginTop: 40, color: "gray" }}>
//             No completed services
//           </Text>
//         ) : (
//           data.map((item, i) => (
//             <View
//               key={item.id || `${item.Customer_Name}-${item.earned_at}`}
//               style={styles.card}
//             >
//               <View style={styles.cardRow}>
//                 <Text style={styles.customerName}>{item.Customer_Name}</Text>

//                 <Text style={styles.amount}>₹{item.AMOUNT}</Text>
//               </View>

//               <Text style={styles.date}>
//                 {dayjs(item.earned_at).format("DD MMM YYYY")}
//               </Text>
//             </View>
//           ))
//         )}
//       </ScrollView>

//       <TouchableOpacity
//         style={styles.floatingDownloadBtn}
//         onPress={generatePDF}
//       >
//         <Ionicons name="download-outline" size={26} color="#000" />

//         <Text style={styles.floatingDownloadText}>Download Report</Text>
//       </TouchableOpacity>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   header: {
//     height: 60,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: 16,
//   },

//   totalText: {
//     fontSize: 20,
//     fontWeight: "bold",
//     marginBottom: 16,
//   },

//   card: {
//     backgroundColor: "#fff",
//     padding: 14,
//     borderRadius: 14,
//     marginTop: 12,

//     borderWidth: 1.5,
//     borderColor: "#FFE066", // ✅ same as monthly

//     elevation: 2,
//   },

//   name: {
//     fontWeight: "700",
//     fontSize: 15,
//   },

//   logo: {
//     width: 190,
//     height: 64,
//   },

//   cardRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },

//   customerName: {
//     fontWeight: "700",
//     fontSize: 15,
//     flex: 1,
//   },

//   amount: {
//     fontWeight: "800",
//     fontSize: 16,
//     color: "#16a34a",
//   },

//   date: {
//     color: "gray",
//     marginTop: 6,
//   },

//   downloadBtn: {
//     backgroundColor: "#000",
//     paddingVertical: 12,
//     borderRadius: 12,
//     marginBottom: 20,

//     flexDirection: "row",
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   downloadText: {
//     color: "#fff",
//     fontWeight: "700",
//     marginLeft: 8,
//     fontSize: 15,
//   },

//   floatingDownloadBtn: {
//     position: "absolute",
//     bottom: 90,
//     right: 16,

//     backgroundColor: "#FFE066",

//     flexDirection: "row",
//     alignItems: "center",

//     paddingHorizontal: 14,
//     paddingVertical: 10,

//     borderRadius: 30,

//     elevation: 5,
//   },

//   floatingDownloadText: {
//     marginLeft: 6,
//     fontWeight: "700",
//     color: "#000",
//     fontSize: 13,
//   },
// });























import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";

import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// import { supabase } from "../lib/supabase";
import { partnerApi } from "../lib/api";

import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
type Booking = {
  id?: string;
  Customer_Name: string;
  AMOUNT: number;
  earned_at: string;
};

export default function TotalEarnings() {
  const router = useRouter();

  const [data, setData] = useState<Booking[]>([]);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);

  const fetchTotalData = async () => {
  setLoading(true);

  try {
    const response = await partnerApi.totalEarnings();

    const bookings: Booking[] = (response.bookings || []).map(
      (item) => ({
        id: item.id,
        Customer_Name: item.customer_name,
        AMOUNT: Number(item.amount || 0),
        earned_at: item.earned_at,
      }),
    );

    setData(bookings);

    setTotal(Number(response.total_earnings || 0));
  } catch (error) {
    console.log(
      "❌ Failed to fetch total earnings:",
      error,
    );

    setData([]);
    setTotal(0);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchTotalData();
  }, []);

  const generatePDF = async () => {
    try {
      const rows = data
        .map(
          (item) => `
        <tr>
<td>${item.Customer_Name}</td>
<td>₹${item.AMOUNT}</td>
<td>${dayjs(item.earned_at).format("DD MMM YYYY")}</td>
        </tr>
      `,
        )
        .join("");

      const html = `
      <html>
        <body style="font-family: Arial; padding: 20px;">
          <h1 style="text-align:center;">
            Earnings Report
          </h1>

          <h2>Total Earnings: ₹${total}</h2>

          <table
            width="100%"
            border="1"
            cellspacing="0"
            cellpadding="8"
            style="border-collapse: collapse; margin-top: 20px;"
          >
            <thead>
              <tr style="background-color:#f2f2f2;">
                <th>Customer</th>
                <th>Amount</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              ${rows}
            </tbody>
          </table>
        </body>
      </html>
    `;

      // Generate PDF
      const { uri } = await Print.printToFileAsync({
        html,
      });

      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: "Earnings Report",
      });

      // Open PDF directly
    } catch (error) {
      console.log("PDF ERROR:", error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace("/my-role")}>
          <Image
            source={require("../assets/images/logo.png")}
            style={styles.logo}
            contentFit="contain"
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            router.canGoBack() ? router.back() : router.replace("/dashboard")
          }
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 120,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* TOTAL */}
        <Text style={styles.totalText}>Total: ₹{total}</Text>

        {/* LIST */}
        {loading ? (
          <Text style={{ textAlign: "center", marginTop: 40 }}>Loading...</Text>
        ) : data.length === 0 ? (
          <Text style={{ textAlign: "center", marginTop: 40, color: "gray" }}>
            No completed services
          </Text>
        ) : (
          data.map((item, i) => (
            <View
              key={item.id || `${item.Customer_Name}-${item.earned_at}`}
              style={styles.card}
            >
              <View style={styles.cardRow}>
                <Text style={styles.customerName}>{item.Customer_Name}</Text>

                <Text style={styles.amount}>₹{item.AMOUNT}</Text>
              </View>

              <Text style={styles.date}>
                {dayjs(item.earned_at).format("DD MMM YYYY")}
              </Text>
            </View>
          ))
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.floatingDownloadBtn}
        onPress={generatePDF}
      >
        <Ionicons name="download-outline" size={26} color="#000" />

        <Text style={styles.floatingDownloadText}>Download Report</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },

  totalText: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },

  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 14,
    marginTop: 12,

    borderWidth: 1.5,
    borderColor: "#FFE066", // ✅ same as monthly

    elevation: 2,
  },

  name: {
    fontWeight: "700",
    fontSize: 15,
  },

  logo: {
    width: 190,
    height: 64,
  },

  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  customerName: {
    fontWeight: "700",
    fontSize: 15,
    flex: 1,
  },

  amount: {
    fontWeight: "800",
    fontSize: 16,
    color: "#16a34a",
  },

  date: {
    color: "gray",
    marginTop: 6,
  },

  downloadBtn: {
    backgroundColor: "#000",
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 20,

    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  downloadText: {
    color: "#fff",
    fontWeight: "700",
    marginLeft: 8,
    fontSize: 15,
  },

  floatingDownloadBtn: {
    position: "absolute",
    bottom: 90,
    right: 16,

    backgroundColor: "#FFE066",

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 14,
    paddingVertical: 10,

    borderRadius: 30,

    elevation: 5,
  },

  floatingDownloadText: {
    marginLeft: 6,
    fontWeight: "700",
    color: "#000",
    fontSize: 13,
  },
});
