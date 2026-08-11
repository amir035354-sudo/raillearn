    import { NextResponse } from "next/server";
    import { createClient } from "@/lib/supabase/server";

    export const dynamic = "force-dynamic";

    export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        console.log("🔥 NEW LESSON API VERSION");

        // ================================
        // CHECK AUTH
        // ================================

        const {
        data: { user },
        error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
        return NextResponse.json(
            {
            error: "Unauthorized",
            },
            {
            status: 401,
            }
        );
        }

        // ================================
        // READ FORM DATA
        // ================================

        const formData = await request.formData();

        const title = String(
        formData.get("title") ?? ""
        ).trim();

        const subjectId = String(
        formData.get("subject_id") ??
            formData.get("subjectId") ??
            ""
        ).trim();

        const description = String(
        formData.get("description") ?? ""
        ).trim();

        const content = String(
        formData.get("content") ?? ""
        ).trim();

        const lessonOrderRaw = String(
        formData.get("lesson_order") ??
            formData.get("lessonOrder") ??
            ""
        ).trim();

        const image = formData.get("image");
        const video = formData.get("video");
        const pdf = formData.get("pdf");

        // ================================
        // VALIDATION
        // ================================

        if (!title) {
        return NextResponse.json(
            {
            error: "Lesson title is required.",
            },
            {
            status: 400,
            }
        );
        }

        if (!subjectId) {
        return NextResponse.json(
            {
            error: "Subject is required.",
            },
            {
            status: 400,
            }
        );
        }

        // ================================
        // CHECK SUBJECT
        // ================================

        const {
        data: subject,
        error: subjectError,
        } = await supabase
        .from("subjects")
        .select("id")
        .eq("id", subjectId)
        .maybeSingle();

        if (subjectError) {
        console.error(
            "SUBJECT CHECK ERROR:",
            subjectError
        );

        return NextResponse.json(
            {
            error: subjectError.message,
            },
            {
            status: 500,
            }
        );
        }

        if (!subject) {
        return NextResponse.json(
            {
            error: "Selected subject was not found.",
            },
            {
            status: 400,
            }
        );
        }

        // ================================
        // UPLOAD FILES
        // ================================

        let imageUrl: string | null = null;
        let videoUrl: string | null = null;
        let pdfUrl: string | null = null;

        // IMAGE
        if (image instanceof File && image.size > 0) {
        if (!image.type.startsWith("image/")) {
            return NextResponse.json(
            {
                error: "Invalid image file.",
            },
            {
                status: 400,
            }
            );
        }

        if (image.size > 5 * 1024 * 1024) {
            return NextResponse.json(
            {
                error: "Image must be smaller than 5MB.",
            },
            {
                status: 400,
            }
            );
        }

        imageUrl = await uploadFile(
            supabase,
            image,
            "lesson-images"
        );
        }

        // VIDEO
        if (video instanceof File && video.size > 0) {
        if (!video.type.startsWith("video/")) {
            return NextResponse.json(
            {
                error: "Invalid video file.",
            },
            {
                status: 400,
            }
            );
        }

        if (video.size > 100 * 1024 * 1024) {
            return NextResponse.json(
            {
                error: "Video must be smaller than 100MB.",
            },
            {
                status: 400,
            }
            );
        }

        videoUrl = await uploadFile(
            supabase,
            video,
            "lesson-videos"
        );
        }

        // PDF
        if (pdf instanceof File && pdf.size > 0) {
        if (pdf.type !== "application/pdf") {
            return NextResponse.json(
            {
                error: "Invalid PDF file.",
            },
            {
                status: 400,
            }
            );
        }

        if (pdf.size > 25 * 1024 * 1024) {
            return NextResponse.json(
            {
                error: "PDF must be smaller than 25MB.",
            },
            {
                status: 400,
            }
            );
        }

        pdfUrl = await uploadFile(
            supabase,
            pdf,
            "lesson-pdfs"
        );
        }

        // ================================
        // LESSON ORDER
        // ================================

        let lessonOrder: number | null = null;

        if (lessonOrderRaw !== "") {
        const parsedOrder = Number(
            lessonOrderRaw
        );

        if (
            !Number.isInteger(parsedOrder) ||
            parsedOrder < 0
        ) {
            return NextResponse.json(
            {
                error:
                "Lesson order must be a valid number.",
            },
            {
                status: 400,
            }
            );
        }

        lessonOrder = parsedOrder;
        }

        // ================================
        // CREATE LESSON
        // ================================

        const {
        data: lesson,
        error: lessonError,
        } = await supabase
        .from("lessons")
        .insert({
            title,
            subject_id: subjectId,
            description:
            description || null,
            content:
            content || null,
            lesson_order: lessonOrder,
            image: imageUrl,
            video: videoUrl,
            pdf: pdfUrl,
        })
        .select()
        .single();

        if (lessonError) {
        console.error(
            "CREATE LESSON ERROR:",
            lessonError
        );

        return NextResponse.json(
            {
            error: lessonError.message,
            },
            {
            status: 400,
            }
        );
        }

        return NextResponse.json(
        {
            success: true,
            lesson,
        },
        {
            status: 201,
        }
        );
    } catch (error) {
        console.error(
        "POST /api/admin/lessons ERROR:",
        error
        );

        return NextResponse.json(
        {
            error:
            error instanceof Error
                ? error.message
                : "Unexpected server error.",
        },
        {
            status: 500,
        }
        );
    }
    }

    // ========================================
    // UPLOAD FILE
    // ========================================

    async function uploadFile(
    supabase: any,
    file: File,
    folder: string
    ): Promise<string> {
    const extension =
        file.name
        .split(".")
        .pop()
        ?.toLowerCase() || "file";

    const cleanName = file.name
        .replace(/\s+/g, "-")
        .replace(
        /[^a-zA-Z0-9._-]/g,
        ""
        );

    const fileName = `${crypto.randomUUID()}.${extension}`;

    const filePath =
        `${folder}/${fileName}`;

    const buffer = Buffer.from(
        await file.arrayBuffer()
    );

    const {
        error: uploadError,
    } = await supabase.storage
        .from("raillearn")
        .upload(
        filePath,
        buffer,
        {
            contentType: file.type,
            upsert: false,
        }
        );

    if (uploadError) {
        console.error(
        `UPLOAD ERROR [${folder}]:`,
        uploadError
        );

        throw new Error(
        `Failed to upload ${cleanName}: ${uploadError.message}`
        );
    }

    const {
        data: publicUrlData,
    } = supabase.storage
        .from("raillearn")
        .getPublicUrl(filePath);

    if (!publicUrlData?.publicUrl) {
        throw new Error(
        `Failed to generate public URL for ${cleanName}.`
        );
    }

    return publicUrlData.publicUrl;
    }