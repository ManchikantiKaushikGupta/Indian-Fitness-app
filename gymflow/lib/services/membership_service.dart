import 'api_service.dart';

class MembershipService {
  final ApiService _api = ApiService();

  Future<bool> assignMembership(int memberId, String planType, String startDate, String endDate) async {
    try {
      await _api.client.post('/members/$memberId/membership', data: {
        'plan_type': planType,
        'start_date': startDate,
        'end_date': endDate,
      });
      return true;
    } catch (e) {
      print('Failed to assign membership: $e');
      return false;
    }
  }
}
