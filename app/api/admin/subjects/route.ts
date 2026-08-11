import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();

    // =========================
    // CHECK LOGIN
    // =========================

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // =========================
    // CHECK ADMIN
    // =========================

    const { data: profile, error: profileError } =
      await supabase
        .from("users")
        .select("id, role")
        .eq("id", user.id)
        .maybeSingle();

    if (profileError) {
      console.error("ADMIN PROFILE ERROR:", profileError);

      return NextResponse.json(
        {
          error: "Failed to verify admin access.",
          details: profileError.message,
        },
        { status: 500 }
      );
    }

    if (!profile) {
      console.error(
        "ADMIN PROFILE NOT FOUND FOR USER:",
        user.id
      );

      return NextResponse.json(
        { error: "Admin profile not found." },
        { status: 403 }
      );
    }

    if (profile.role !== "admin") {
      console.error(
        "USER IS NOT ADMIN:",
        profile.role
      );

      return NextResponse.json(
        { error: "Admin access required." },
        { status: 403 }
      );
    }

    // =========================
    // GET SUBJECTS
    // =========================

    const { data: subjects, error: subjectsError } =
      await supabase
        .from("subjects")
        .select("id, name, code")
        .order("created_at", {
          ascending: true,
        });

    if (subjectsError) {
      console.error(
        "SUBJECTS ERROR:",
        subjectsError
      );

      return NextResponse.json(
        { error: subjectsError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        subjects: subjects ?? [],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "GET /api/admin/subjects ERROR:",
      error
    );

    return NextResponse.json(
      {
        error: "Internal server error.",
      },
      { status: 500 }
    );
  }
}

// =====================================================
// CREATE SUBJECT
// =====================================================

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { data: profile, error: profileError } =
      await supabase
        .from("users")
        .select("id, role")
        .eq("id", user.id)
        .maybeSingle();

    if (profileError) {
      console.error(
        "POST ADMIN PROFILE ERROR:",
        profileError
      );

      return NextResponse.json(
        {
          error: "Failed to verify admin access.",
        },
        { status: 500 }
      );
    }

    if (!profile || profile.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required." },
        { status: 403 }
      );
    }

    const formData = await request.formData();

    const name = String(
      formData.get("name") || ""
    ).trim();

    const code = String(
      formData.get("code") || ""
    ).trim();

    const semesterValue = String(
      formData.get("semester") || ""
    ).trim();

    const description = String(
      formData.get("description") || ""
    ).trim();

    const image = formData.get("image");

    if (!name) {
      return NextResponse.json(
        {
          error: "Subject name is required.",
        },
        { status: 400 }
      );
    }

    let imageUrl: string | null = null;

    // =========================
    // UPLOAD IMAGE
    // =========================

    if (image instanceof File && image.size > 0) {
      if (!image.type.startsWith("image/")) {
        return NextResponse.json(
          {
            error: "Invalid image file.",
          },
          { status: 400 }
        );
      }

      if (image.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          {
            error: "Image must be smaller than 5MB.",
          },
          { status: 400 }
        );
      }

      const extension =
        image.name
          .split(".")
          .pop()
          ?.toLowerCase() || "jpg";

      const fileName =
        `${crypto.randomUUID()}.${extension}`;

      const filePath =
        `subjects/${fileName}`;

      const buffer = Buffer.from(
        await image.arrayBuffer()
      );

      const { error: uploadError } =
        await supabase.storage
          .from("subjects")
          .upload(filePath, buffer, {
            contentType: image.type,
            upsert: false,
          });

      if (uploadError) {
        console.error(
          "SUBJECT IMAGE UPLOAD ERROR:",
          uploadError
        );

        return NextResponse.json(
          {
            error:
              "Failed to upload subject image.",
          },
          { status: 500 }
        );
      }

      const {
        data: { publicUrl },
      } = supabase.storage
        .from("subjects")
        .getPublicUrl(filePath);

      imageUrl = publicUrl;
    }

    // =========================
    // SEMESTER
    // =========================

    const semester =
      semesterValue === ""
        ? null
        : Number(semesterValue);

    if (
      semester !== null &&
      (!Number.isInteger(semester) ||
        semester < 1 ||
        semester > 12)
    ) {
      return NextResponse.json(
        {
          error: "Invalid semester.",
        },
        { status: 400 }
      );
    }

    // =========================
    // INSERT SUBJECT
    // =========================

    const { data, error } =
      await supabase
        .from("subjects")
        .insert({
          name,
          code: code || null,
          semester,
          description:
            description || null,
          image_url: imageUrl,
        })
        .select()
        .single();

    if (error) {
      console.error(
        "CREATE SUBJECT ERROR:",
        error
      );

      return NextResponse.json(
        {
          error:
            "Failed to create subject.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      subject: data,
    });
  } catch (error) {
    console.error(
      "POST /api/admin/subjects ERROR:",
      error
    );

    return NextResponse.json(
      {
        error: "Internal server error.",
      },
      { status: 500 }
    );
  }
}