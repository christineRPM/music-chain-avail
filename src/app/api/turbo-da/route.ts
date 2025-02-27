import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.text();
    console.log('🎵 TurboDA: Received submission request:', {
      dataLength: data.length,
      preview: data.substring(0, 100) + '...'
    });
    
    const turboDAUrl = `${process.env.TURBODA_API}/v1/submit_raw_data`;
    console.log('🔗 TurboDA: Sending to:', turboDAUrl);
    
    const response = await fetch(turboDAUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'x-api-key': `${process.env.TURBODA_API_KEY}`
      },
      body: data
    });

    // First get the raw text response
    const rawResponse = await response.text();
    console.log('📝 TurboDA: Raw response:', rawResponse);

    let responseData;
    try {
      // Try to parse as JSON if possible
      responseData = JSON.parse(rawResponse);
    } catch (parseError) {
      // If not JSON, use the raw text
      console.log(parseError);
      responseData = { message: rawResponse };
    }
    
    if (!response.ok) {
      console.error('❌ TurboDA: Submission failed:', {
        status: response.status,
        statusText: response.statusText,
        error: responseData
      });
      throw new Error(responseData.message || 'Failed to submit to TurboDA');
    }

    console.log('✅ TurboDA: Submission successful:', {
      status: response.status,
      response: responseData
    });

    return NextResponse.json({ 
      success: true, 
      data: responseData,
      status: response.status,
      statusText: response.statusText
    });
  } catch (error) {
    console.error('💥 TurboDA: Error in submission:', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
} 