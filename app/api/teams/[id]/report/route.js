import { connectDB } from '@/lib/mongodb';
import Team from '@/models/Team';

export async function PUT(req, { params }) {
  await connectDB();
  const { id } = params;
  const body = await req.json();

  try {
    const reportMap = body.report || {};
    let grandTotal = 0;

    // Sum total tasks across all members
    for (const memberId in reportMap) {
      const memberData = reportMap[memberId];
      if (memberData?.total) {
        grandTotal += memberData.total;
      }
    }

    const updatedTeam = await Team.findByIdAndUpdate(
      id,
      {
        report: reportMap,
        grandTotal,
      },
      { new: true }
    );

    return new Response(JSON.stringify(updatedTeam), { status: 200 });
  } catch (err) {
    console.error('Error saving report:', err);
    return new Response(JSON.stringify({ message: 'Failed to save report' }), {
      status: 500,
    });
  }
}
