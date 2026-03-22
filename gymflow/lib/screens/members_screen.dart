import 'package:flutter/material.dart';
import '../services/member_service.dart';
import 'member_detail_screen.dart';
import 'add_member_screen.dart';

class MembersScreen extends StatefulWidget {
  @override
  _MembersScreenState createState() => _MembersScreenState();
}

class _MembersScreenState extends State<MembersScreen> {
  final MemberService _memberService = MemberService();
  List<dynamic> _members = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchMembers();
  }

  Future<void> _fetchMembers() async {
    if (!mounted) return; setState(() => _isLoading = true);
    final members = await _memberService.getMembers();
    if (!mounted) return; setState(() {
      _members = members;
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Manage Members'),
        actions: [
          IconButton(
            icon: Icon(Icons.refresh),
            onPressed: _fetchMembers,
          )
        ],
      ),
      body: _isLoading
          ? Center(child: CircularProgressIndicator())
          : _members.isEmpty
              ? Center(child: Text('No members found. Add one!'))
              : ListView.builder(
                  itemCount: _members.length,
                  itemBuilder: (context, index) {
                    final member = _members[index];
                    return ListTile(
                      leading: CircleAvatar(child: Text(member['name'][0].toUpperCase())),
                      title: Text(member['name']),
                      subtitle: Text(member['phone']),
                      trailing: Icon(Icons.arrow_forward_ios, size: 16),
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (c) => MemberDetailScreen(memberId: member['id']),
                          ),
                        ).then((_) => _fetchMembers()); // Refresh on return
                      },
                    );
                  },
                ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (c) => AddMemberScreen()),
          ).then((_) => _fetchMembers());
        },
        child: Icon(Icons.add),
      ),
    );
  }
}
